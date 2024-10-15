import { CollectionConfig } from 'payload/types';

export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',
  admin: {
    useAsTitle: 'code',
  },
  access: {
    read: () => true, // Allow all users to read promo codes
    create: ({ req }) => req.user.role === 'admin', // Only admin can create
    update: ({ req }) => req.user.role === 'admin', // Only admin can update
    delete: ({ req }) => req.user.role === 'admin', // Only admin can delete
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: 'Promo Code',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'discountPercentage',
      type: 'number',
      required: true,
      label: 'Discount Percentage (%)',
      min: 1,
      max: 100,
    },
    {
      name: 'validFrom',
      type: 'date',
      required: true,
      label: 'Valid From',
    },
    {
      name: 'validUntil',
      type: 'date',
      required: true,
      label: 'Valid Until',
    },
    {
      name: 'maxUses',
      type: 'number',
      label: 'Max Uses',
      defaultValue: 1,
      required: true,
    },
    {
      name: 'currentUses',
      type: 'number',
      label: 'Current Uses',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
};
