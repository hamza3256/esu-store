import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return `<a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}">Verify email</a>`;
      },
    },
  },
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
        // condition: ({ req }) => req.user.role === "superadmin",
      },
      type: "select",
      options: [
        {
          label: "Super Admin",
          value: "superadmin",
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
