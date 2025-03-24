"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Badge } from '@/components/ui/badge';
import { Percent, Timer, Tag, Sparkles } from 'lucide-react';
import ProductReel from '@/components/ProductReel';

export default function SpecialOffersPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-red-50 py-12">
        <MaxWidthWrapper>
          <div className="flex items-center gap-4 mb-4">
            <Percent className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mb-6">
            Discover incredible deals on our finest jewellery. Limited-time offers and exclusive discounts await.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2">
              <Timer className="h-4 w-4 mr-2" />
              Limited Time
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Tag className="h-4 w-4 mr-2" />
              Best Value
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Exclusive Deals
            </Badge>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-12">
        {/* Flash Sales */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Timer className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-semibold">Flash Sales</h2>
            </div>
            <Badge variant="destructive">Ends Soon</Badge>
          </div>
          <ProductReel 
            title="Flash Sales"
            subtitle="Don't miss out on these time-limited deals"
            href="/special-offers"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Clearance */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold">Clearance</h2>
          </div>
          <ProductReel 
            title="Clearance"
            subtitle="Up to 70% off on selected items"
            href="/special-offers"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Bundle Deals */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold">Bundle Deals</h2>
          </div>
          <ProductReel 
            title="Bundle Deals"
            subtitle="Save more when you buy together"
            href="/special-offers"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 