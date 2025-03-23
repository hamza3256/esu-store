"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Eye, TrendingUp, Clock, Star } from 'lucide-react';
import ProductReel from '@/components/ProductReel';
import { Card, CardContent } from '@/components/ui/card';

export default function MostViewedPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
        <MaxWidthWrapper>
          <div className="flex items-center gap-4 mb-6">
            <Eye className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Most Viewed Products
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg mb-8">
            Discover what&apos;s catching everyone&apos;s eye. These pieces have captured the attention of jewelry enthusiasts worldwide.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Eye className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Daily Views</p>
                  <p className="text-2xl font-bold">2.5K+</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <TrendingUp className="h-8 w-8 text-pink-500" />
                <div>
                  <p className="text-sm text-gray-500">Trending Score</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg. Time Viewed</p>
                  <p className="text-2xl font-bold">2m 30s</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-12">
        {/* Today's Most Viewed */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Today&apos;s Most Viewed</h2>
          </div>
          <ProductReel 
            title="Today&apos;s Trending"
            subtitle="Products that are trending today"
            href="/trending/most-viewed"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Weekly Highlights */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-pink-500" />
            <h2 className="text-2xl font-semibold">Weekly Highlights</h2>
          </div>
          <ProductReel 
            title="Weekly Highlights"
            subtitle="Most popular products this week"
            href="/trending/most-viewed"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Most Reviewed */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Most Reviewed</h2>
          </div>
          <ProductReel 
            title="Most Reviewed"
            subtitle="Products with the most customer reviews"
            href="/trending/most-viewed"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 