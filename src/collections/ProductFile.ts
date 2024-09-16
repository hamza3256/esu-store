import { User } from "@/payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

// Add the user to the product file before saving
const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

// Access control for product files (your own or purchased ones)
const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;

  if (user?.role === "admin") return true;
  if (!user) return false;

  // Get the product files owned by the user
  const { docs: products } = await req.payload.find({
    collection: "products",
    depth: 0, // Fetch shallow relationships
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const ownProductFileIds = products
    .map((prod) => (prod.product_files ? prod.product_files : []))
    .flat();

  // Get the product files from purchased orders
  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 2, // Fetch deeper relationships for orders and products
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFileIds = orders
    .map((order) => {
      return order.productItems
        .map((item) => {
          const product = item.product;

          // Handle both populated and unpopulated product relationships
          if (typeof product === "string") {
            req.payload.logger.error(
              "Search depth not sufficient to find purchased file IDs"
            );
            return null;
          }

          // Return the product_files ID or URL
          return typeof product.product_files === "string"
            ? product.product_files
            : product.product_files?.id;
        })
        .filter(Boolean); // Filter out null/undefined values
    })
    .flat();

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds],
    },
  };
};

export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  upload: {
    staticURL: "/product_files",
    staticDir: "product_files",
    mimeTypes: ["image/*", "font/*", "application/postscript"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      admin: {
        condition: () => false,
      },
      required: true,
    },
  ],
};
