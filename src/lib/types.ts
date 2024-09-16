// src/types.ts

import { Media, Product, ProductFile, User } from "@/payload-types";

export type Order = {
    id: string;
    orderNumber: string;
    createdAt: string;
    updatedAt: string;
    status?: ('pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') | null;
    _isPaid: boolean;
    total: number;
    user: string | User;
    productItems: {
        product: Product;
        quantity: number;
        id?: string | null;
      }[];
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  export interface ProductType {
    id: string;
    user?: (string | null) | User;
    name: string;
    description?: string | null;
    price: number;
    category: 'clothing' | 'jewellery' | 'accessories';
    inventory: number;
    numReviews: number;
    rating: number;
    product_files: string | ProductFile;
    approvedForSale?: ('pending' | 'approved' | 'denied') | null;
    priceId?: string | null;
    stripeId?: string | null;
    images: {
      image: string | Media;
      id?: string | null;
    }[];
    updatedAt: string;
    createdAt: string;
  }
  