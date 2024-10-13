import { Access, CollectionConfig } from "payload/types";

const yourOwn: Access = ({ req: { user } }) => {
  if (user.role === "admin") return true;
  return {
    user: {
      equals: user?.id,
    },
  };
};

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "Your Orders",
    description: "A summary of all your orders on ESU Store.",
  },
  access: {
    read: ({ req }) => req.user?.role === "admin" || !!req.user, // Allow admin and authenticated users to access orders
    update: ({ req }) => req.user?.role === "admin", // Only admin can update
    delete: ({ req }) => req.user?.role === "admin", // Only admin can delete
    create: () => true, // Allow creation without a logged-in user
  },
  fields: [
    {
      name: "_isPaid",
      type: "checkbox",
      access: {
        read: ({ req }) => req.user.role === "admin",
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      required: true,
    },
    {
      name: "_isPostexOrderCreated",
      type: "checkbox",
      access: {
        read: ({ req }) => req.user.role === "admin",
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      required: true,
    },
    {
      name: "trackingInfo", // Add tracking information for PostEx
      type: "group",
      fields: [
        { name: "trackingNumber", type: "text" },
        { name: "orderStatus", type: "text" },
        { name: "orderDate", type: "text" },
      ],
      admin: {
        hidden: true, // Hidden from UI by default
      },
      access: {
        read: ({ req }) => req.user.role === "admin",
      },
    },
    {
      name: "user",
      type: "relationship",
      admin: {
        hidden: true,
      },
      relationTo: "users",
      required: false,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email", // Collect email for anonymous orders
      type: "email",
      required: true,
    },
    {
      name: "phone", // Add phone field for customer phone number
      type: "text",
      required: true,
    },
    {
      name: "productItems",
      type: "array",
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          defaultValue: 1,
        },
        {
          name: "priceAtPurchase",
          label: "Price at Purchase",
          type: "number",
          required: true,
          admin: {
            readOnly: true, 
          },
        },
      ],
      required: true,
    },    
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "line1", type: "text", required: true },
        { name: "line2", type: "text" },
        { name: "city", type: "text", required: true },
        { name: "state", type: "text",},
        { name: "postalCode", type: "text" },
        { name: "country", type: "text", required: true },
      ],
    },
    // Add order status field
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
      ],
      defaultValue: "pending",
    },
    {
      name: "total",
      type: "number",
      required: true
    },
    {
      name: "orderNumber",
      type: "text",
      unique: true, 
      required: true,
    },
    {
      name: "_emailSent",
      type: "checkbox",
      defaultValue: false
    },
    {
      name: "paymentType",
      label: "Payment Type",
      type: "select",
      options: [
        { label: "Card", value: "card" },
        { label: "Cash on Delivery", value: "cod" },
      ],
      required: true,
      defaultValue: "card",
    },
  ],
};
