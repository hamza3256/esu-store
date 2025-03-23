"use client";

import { useEffect, useState } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/payload-types';
import ProductReel from '@/components/ProductReel';
import { Crown, Flame, TrendingUp } from 'lucide-react';

export default function BestSellersPage() {
  return (
    <>
      <div className="relative">
        {/* Hero Section */}
        <div className="bg-black text-white py-12">
          <MaxWidthWrapper>
            <div className="flex items-center gap-4 mb-4">
              <Flame className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Best Sellers</h1>
            </div>
            <p className="text-gray-400 max-w-2xl">
              Discover our most popular pieces that have captured hearts worldwide. Each item here has been chosen by our community of jewelry enthusiasts.
            </p>
          </MaxWidthWrapper>
        </div>

        <MaxWidthWrapper className="py-8">
          {/* Top Sellers Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Top Sellers This Week</h2>
            <ProductReel 
              title="Top Sellers"
              subtitle="Our most popular products based on sales"
              href="/trending/best-sellers"
              query={{ sort: 'desc', limit: 4 }}
            />
          </div>

          {/* All-Time Favorites */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">All-Time Favorites</h2>
            <ProductReel 
              title="Customer Favorites"
              subtitle="Consistently top-rated products"
              href="/trending/best-sellers"
              query={{ sort: 'desc', limit: 4 }}
            />
          </div>

          {/* Trending Now */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
            <ProductReel 
              title="Trending"
              subtitle="Products gaining popularity right now"
              href="/trending/best-sellers"
              query={{ sort: 'desc', limit: 4 }}
            />
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
} 