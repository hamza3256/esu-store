import { PrimaryActionEmailHtml } from "../components/emails/PrimaryActionEmail";
import { Access, CollectionConfig } from "payload/types";

const adminsAndUser: Access = ({ req: { user } }) => {
  if (user.role === "admin" || user.role === "superadmin") return true;

  return { id: { equals: user.id } };
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return PrimaryActionEmailHtml({
          actionLabel: "Verify your account",
          buttonText: "Verify Account",
          href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
        });
      },
    },
  },
  access: {
    read: adminsAndUser,
    create: () => true,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin",
    defaultColumns: ["id"],
  },
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
    },
    {
      name: "stripeCustomerId",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "products",
      label: "Products",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "product_files",
      label: "Product files",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "product_files",
      hasMany: true,
    },
    {
      name: "role", // "Super Admin", "Admins", "Users"
      defaultValue: "user",
      required: true,
      admin: {
        condition: ({ req }) => {
          if (req?.user?.role === "admin" || req?.user?.role === "superadmin") {
            return true;
          }
          return false;
        },
      },
      type: "select",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Employee",
          value: "employee"
        },
        {
          label: "Seller",
          value: "seller"
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
};
