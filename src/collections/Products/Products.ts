import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "../../payload-types";
import { stripe } from "../../lib/stripe";
import type Stripe from "stripe";

const defaultCurrency = "PKR"

// Add User Hook: Allow for guest checkouts by handling cases where there's no logged-in user
const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;

  // If there is no user (guest checkout), skip attaching the user
  if (!user || !user.id) {
    return data; // Skip attaching the user for guest checkout
  }

  return { ...data, user: user.id };
};

// Sync User Hook: Ensure that the user-related data is only updated for logged-in users, skip for guests
const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
  if (!req.user || !req.user.id) return; // Skip syncing for guest checkouts

  const fullUserObject = await req.payload.findByID({
    collection: "users",
    id: req.user.id,
  });

  if (fullUserObject && typeof fullUserObject === "object") {
    const { products } = fullUserObject;

    const allIds = [
      ...(products?.map((product) =>
        typeof product === "object" ? product.id : product
      ) || []),
    ];

    const createdProductIds = allIds.filter(
      (id, index) => allIds.indexOf(id) == index
    );

    const dataToUpdate = [...createdProductIds, doc.id];

    await req.payload.update({
      collection: "users",
      id: fullUserObject.id,
      data: {
        products: dataToUpdate,
      },
    });
  }
};

// Helper function to handle image uploads
const uploadImageToStripe = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl); // Assuming imageUrl is publicly accessible
  const buffer = await response.arrayBuffer(); // Convert image to buffer
  const uploadedImage = await stripe.files.create({
    purpose: 'product_image' as Stripe.FileCreateParams.Purpose,
    file: {
      data: Buffer.from(buffer), // Ensure the buffer is converted correctly
      name: 'product_image.jpg',
      type: 'application/octet-stream',
    },
  });
  return uploadedImage.id;
};

const handleProductChange: BeforeChangeHook<Product> = async ({ operation, data, req }) => {
  const productData = data as Product;

  // Ensure price is passed and a valid Stripe product exists
  if (!productData.price || (operation === 'update' && !productData.stripeId)) return data;

  let stripeProduct;
  let stripePrice;

  const validUrls = await Promise.all(
    productData.images.map(async ({ image }) => {
      if (typeof image === "string") {
        // Resolve the image URL from the Payload media collection
        const mediaDoc = await req.payload.findByID({ collection: "media", id: image });

        // Ensure only images are considered (filter out videos based on mimeType)
        if (mediaDoc?.mimeType?.startsWith("image/")) {
          return mediaDoc.url;  // Use the URL field from the Cloudinary document
        }
      } else if (image.mimeType?.startsWith("image/")) {
        return image.url; // If image is already an object with a valid mimeType
      }
    })
  );
  
  const imageUrl = validUrls.filter(Boolean)[0]; // Get the first valid image URL

  let imageId: string | undefined;

  // Upload the first image to Stripe if available
  if (imageUrl) {
    imageId = await uploadImageToStripe(imageUrl).catch((error) => {
      console.error("Error uploading image to Stripe:", error);
      return undefined;
    });
  }

  if (operation === 'create') {
    const productPrice = productData.discountedPrice ?? productData.price;
    
    // Create the Stripe product and associate the uploaded image
    stripeProduct = await stripe.products.create({
      name: productData.name,
      images: imageId ? [imageId] : undefined,
    });

    // Create a price for the product
    stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'PKR',
      unit_amount: Math.round(productPrice * 100),
    });

    // Set the created price as the default price for the product
    await stripe.products.update(stripeProduct.id, {
      default_price: stripePrice.id,
    });

  } else if (operation === 'update') {
    const productPrice = productData.discountedPrice ?? productData.price;
    
    // Update the Stripe product and associate the new image, if applicable
    await stripe.products.update(productData.stripeId!, {
      name: productData.name,
      images: imageId ? [imageId] : undefined,
    });

    // Create a new price for the updated product price
    stripePrice = await stripe.prices.create({
      product: productData.stripeId!,
      currency: defaultCurrency,
      unit_amount: Math.round(productPrice * 100),
    });

    // Set the newly created price as the default price for the product
    await stripe.products.update(productData.stripeId!, {
      default_price: stripePrice.id,
    });
  }

  // Return updated product data including Stripe price and product IDs
  return {
    ...data,
    stripeId: stripeProduct?.id || productData.stripeId,
    priceId: stripePrice?.id || productData.priceId,
  };
};



// Access control modification to accommodate guest operations
const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined;

    if (!user) return false;
    if (user.role === "admin") return true;

    const userProductIds = (user.products || []).reduce<Array<string>>(
      (acc, product) => {
        if (!product) return acc;
        if (typeof product === "string") {
          acc.push(product);
        } else {
          acc.push(product.id);
        }
        return acc;
      },
      []
    );

    return { id: { in: userProductIds } };
  };

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true, // Allow all users, including guests, to read the products
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  hooks: {
    beforeChange: [addUser, handleProductChange], // Use updated hook to handle Stripe
    afterChange: [syncUser],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: false, // Make user field optional to allow guest purchases
      hasMany: false,
      admin: {
        condition: () => false, // Hide this field from admin panel
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Product details",
    },
    {
      name: "price",
      label: "Price in PKR",
      min: 0,
      max: 999999,
      type: "number",
      required: true,
    },
    {
      name: "discountedPrice",
      label: "Discounted Price",
      type: "number",
      min: 0,
      max: 999999,
      required: false,
      admin: {
        description: "Enter the discounted price if applicable. Leave empty if no discount.",
      },
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({
        label,
        value,
      })),
      required: true,
    },
    {
      name: "inventory",
      label: "Inventory",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "numReviews",
      label: "Number of Reviews",
      type: "number",
      defaultValue: 0,
      required: true,
    },
    {
      name: "rating",
      label: "Rating",
      type: "number",
      required: true,
      min: 0,
      max: 5,
      defaultValue: 0,
    },
    {
      name: "product_files",
      label: "Product file(s)",
      type: "relationship",
      required: false,
      relationTo: "product_files",
      hasMany: false,
    },
    {
      name: "approvedForSale",
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      access: {
        create: ({ req }) => req.user?.role === "admin", // Allow only admins to create
        read: () => true, // Allow guests to read product status
        update: ({ req }) => req.user?.role === "admin", // Allow only admins to update
      },
      options: [
        {
          label: "Pending verification",
          value: "pending",
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Denied",
          value: "denied",
        },
      ],
    },
    {
      name: "priceId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "images",
      type: "array",
      label: "Product images",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
