import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "../../payload-types";
import { stripe } from "../../lib/stripe";

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
    beforeChange: [addUser],
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
      label: "Price in USD",
      min: 0,
      max: 5000,
      type: "number",
      required: true,
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
      required: true,
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
