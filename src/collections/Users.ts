import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: "role", // "Super Admin", "Admins", "Users"
      defaultValue: "user",
      required: true,
      admin: {
        condition: ({ req }) => req.user.role === "super admin",
      },
      type: "select",
      options: [
        {
          label: "Super Admin",
          value: "super admin",
        },
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
  ],
};
