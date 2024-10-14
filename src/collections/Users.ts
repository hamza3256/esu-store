import { PrimaryActionEmailHtml } from "../components/emails/PrimaryActionEmail";
import { Access, CollectionConfig } from "payload/types";

// Access control function for admins, sellers, and employees
const adminsSellersEmployees: Access = ({ req: { user } }) => {
  const allowedRoles = ["admin", "seller", "employee"];
  if (user && allowedRoles.includes(user.role)) {
    return true;
  }
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
    read: adminsSellersEmployees,
    create: () => true,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin", 
    admin: ({ req: { user } }) => user.role !== "user",
  },
  admin: {
    hidden: ({ user }) => user.role === "user",
    defaultColumns: ["id", "name", "email"]
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
      name: "role",
      defaultValue: "user",
      required: true,
      admin: {
        condition: ({ req }) => {
          return req?.user?.role === "admin";
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
          value: "employee",
        },
        {
          label: "Seller",
          value: "seller",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
};
