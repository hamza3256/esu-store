"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Timer, Diamond, Crown, Star } from 'lucide-react';
import ProductReel from '@/components/ProductReel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const COLLECTION_STATS = [
  { label: 'Limited Pieces', value: '50', icon: Diamond },
  { label: 'Sold Out', value: '80%', icon: Crown },
  { label: 'Days Left', value: '15', icon: Timer },
];

export default function LimitedEditionPage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative py-24">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2940&auto=format&fit=crop"
            alt="Limited Edition background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <MaxWidthWrapper className="relative">
          <Badge variant="secondary" className="mb-4">Limited Time Only</Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Limited Edition Collection
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg mb-12">
            Discover our exclusive limited edition pieces. Once they&apos;re gone, they&apos;re gone forever. Each piece is numbered and comes with a certificate of authenticity.
          </p>

          {/* Collection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {COLLECTION_STATS.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="bg-white/5 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-3xl font-bold">{value}</p>
                      <p className="text-gray-400">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-16">
        {/* Available Now */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-purple-400" />
              <h2 className="text-3xl font-bold">Available Now</h2>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              15 Days Remaining
            </Badge>
          </div>
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Sold</span>
              <span>80%</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
          <ProductReel 
            title="Limited Edition"
            subtitle="Available for a limited time only"
            href="/premium/limited-edition"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Collection Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Collection Highlights</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Diamond className="h-6 w-6 text-purple-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Rare Materials</h3>
                  <p className="text-gray-400">
                    Each piece features carefully selected rare gems and precious metals, ensuring unparalleled quality and uniqueness.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Crown className="h-6 w-6 text-purple-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Numbered Pieces</h3>
                  <p className="text-gray-400">
                    Every item is individually numbered and comes with a certificate of authenticity, making each piece truly special.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Star className="h-6 w-6 text-purple-400 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Exclusive Design</h3>
                  <p className="text-gray-400">
                    Unique designs that will never be reproduced, ensuring your piece remains truly one-of-a-kind.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2940&auto=format&fit=crop"
              alt="Limited Edition Jewelry"
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="mb-2">Featured Piece</Badge>
              <h3 className="text-xl font-semibold mb-2">The Royal Collection</h3>
              <p className="text-sm text-gray-200">Only 10 pieces available worldwide</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Timer className="h-8 w-8 text-purple-400" />
            <h2 className="text-3xl font-bold">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="bg-white/5 border-0 overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop"
                    alt={`Coming Soon Collection ${item}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg px-6 py-3">
                      Launching Soon
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 