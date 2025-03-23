"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Package, Diamond, Crown, Star } from 'lucide-react';
import ProductReel from '@/components/ProductReel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const CURATED_COLLECTIONS = [
  {
    title: "The Royal Suite",
    description: "A complete set of matching necklace, earrings, and bracelet in 18k gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop",
    pieces: 3,
  },
  {
    title: "The Pearl Collection",
    description: "Elegant freshwater pearl set with matching accessories",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop",
    pieces: 4,
  },
  {
    title: "The Diamond Ensemble",
    description: "Stunning diamond-encrusted set for special occasions",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2940&auto=format&fit=crop",
    pieces: 5,
  },
];

export default function CuratedSetsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-gray-100 to-gray-50">
        <MaxWidthWrapper>
          <div className="flex items-center gap-4 mb-8">
            <Package className="h-12 w-12 text-gray-900" />
            <div>
              <h1 className="text-5xl font-bold text-gray-900">
                Curated Sets
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Perfectly matched collections for every occasion
              </p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg mb-12">
            Each set is thoughtfully curated by our expert stylists, ensuring perfect harmony between pieces. Experience the luxury of a complete, coordinated look.
          </p>

          {/* Collection Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Diamond className="h-8 w-8 text-gray-900" />
              <div>
                <h3 className="font-semibold text-gray-900">Perfect Match</h3>
                <p className="text-gray-600">Harmoniously designed</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Crown className="h-8 w-8 text-gray-900" />
              <div>
                <h3 className="font-semibold text-gray-900">Expert Curation</h3>
                <p className="text-gray-600">Styled by professionals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-gray-900" />
              <div>
                <h3 className="font-semibold text-gray-900">Value Sets</h3>
                <p className="text-gray-600">Special collection pricing</p>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-16">
        {/* Featured Sets */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Crown className="h-8 w-8 text-gray-900" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Sets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CURATED_COLLECTIONS.map((collection) => (
              <Card key={collection.title} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="mb-2">{collection.pieces} Pieces</Badge>
                    <h3 className="text-xl font-semibold text-white mb-2">{collection.title}</h3>
                    <p className="text-sm text-gray-200">{collection.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Complete Sets */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-gray-900" />
            <h2 className="text-3xl font-bold text-gray-900">Complete Sets</h2>
          </div>
          <ProductReel 
            title="Complete Sets"
            subtitle="Full collections ready to wear"
            href="/premium/curated-sets"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Mix & Match */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Diamond className="h-8 w-8 text-gray-900" />
            <h2 className="text-3xl font-bold text-gray-900">Mix & Match</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Create Your Own Set</h3>
              <p className="text-gray-600 mb-6">
                Can&apos;t find the perfect combination? Create your own curated set from our extensive collection. Our style experts will help you put together pieces that complement each other perfectly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-900" />
                  <span>Personal styling consultation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-900" />
                  <span>Special pricing on sets</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-900" />
                  <span>Complimentary gift packaging</span>
                </li>
              </ul>
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2940&auto=format&fit=crop"
                alt="Mix & Match"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 