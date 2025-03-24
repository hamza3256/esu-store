// src/types.ts

import { Media, Product, ProductFile, User } from "@/payload-types";

export type Order = {
    id: string;
    orderNumber: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    status?: ('pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') | null;
    _isPaid: boolean;
    _isPostexOrderCreated: boolean;
    trackingInfo?: {
      trackingNumber?: string | null;
      orderStatus?: string | null;
      orderDate?: string | null;
    };
    _emailSent: boolean;
    total: number;
    user: string | User;
    productItems: {
        product: Product;
        quantity: number;
        id?: string | null;
        priceAtPurchase: number;
      }[];
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode?: string;
      country: string;
    };
    phone: string;
    paymentType: 'card' | 'cod';
    appliedPromoCode?: (string | null) | PromoCode;
  };

  export type PromoCode = {
    id: string;
    code: string;
    description?: string | null;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    maxUses: number;
    currentUses?: number | null;
    updatedAt: string;
    createdAt: string;
  }

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
  