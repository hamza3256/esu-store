"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Crown, Diamond, Star } from 'lucide-react';
import ProductReel from '@/components/ProductReel';

export default function PremiumCollectionPage() {
  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative py-16">
        <MaxWidthWrapper>
          <div className="flex items-center gap-4 mb-6">
            <Crown className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">Premium Collection</h1>
          </div>
          <p className="text-gray-300 max-w-2xl text-lg mb-8">
            Experience luxury redefined. Our premium collection features exquisite pieces crafted with the finest materials and unparalleled artistry.
          </p>
          <div className="flex gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Diamond className="h-5 w-5 text-blue-400" />
              <span>Finest Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Expert Craftsmanship</span>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper>
        {/* Limited Edition */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-semibold">Limited Edition</h2>
          </div>
          <ProductReel 
            title="Limited Edition"
            subtitle="Exclusive pieces available for a limited time"
            href="/premium/collection"
            query={{ sort: 'desc', limit: 3 }}
          />
        </div>

        {/* Signature Collection */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Diamond className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-semibold">Signature Collection</h2>
          </div>
          <ProductReel 
            title="Signature Collection"
            subtitle="Our most prestigious designs"
            href="/premium/collection"
            query={{ sort: 'desc', limit: 3 }}
          />
        </div>

        {/* Bespoke Pieces */}
        <div className="pb-16">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-semibold">Bespoke Pieces</h2>
          </div>
          <ProductReel 
            title="Bespoke Pieces"
            subtitle="Custom-crafted masterpieces"
            href="/premium/collection"
            query={{ sort: 'desc', limit: 3 }}
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 