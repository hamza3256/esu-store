"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Crown, Diamond, Award, Star } from 'lucide-react';
import ProductReel from '@/components/ProductReel';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function SignatureSeriesPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=2940&auto=format&fit=crop"
            alt="Luxury background"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <MaxWidthWrapper className="relative">
          <div className="flex items-center gap-4 mb-8">
            <Crown className="h-12 w-12 text-yellow-400" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Signature Series
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Where luxury meets artistry
              </p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl text-lg mb-12 leading-relaxed">
            Experience the pinnacle of jewelry craftsmanship with our Signature Series. Each piece is meticulously crafted by master artisans, representing the epitome of luxury and sophistication.
          </p>

          {/* Craftsmanship Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Diamond className="h-8 w-8 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-white">Finest Materials</h3>
                <p className="text-gray-400">Premium gems & metals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-white">Master Crafted</h3>
                <p className="text-gray-400">Expert artisanship</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-white">Limited Edition</h3>
                <p className="text-gray-400">Exclusive pieces</p>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-16">
        {/* Featured Collection */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold">Featured Collection</h2>
          </div>
          <ProductReel 
            title="Featured Collection"
            subtitle="Our most prestigious pieces"
            href="/premium/signature"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Collection Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">The Art of Craftsmanship</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Each piece in our Signature Series undergoes a meticulous creation process, combining traditional techniques with modern innovation. Our master artisans spend countless hours ensuring every detail meets our exacting standards.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Diamond className="h-5 w-5 text-yellow-400" />
                <span>Hand-selected premium materials</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-400" />
                <span>Certified master craftsmanship</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>Limited production runs</span>
              </div>
            </div>
          </div>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <div className="aspect-video relative mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1589726047650-f697a5139546?q=80&w=2940&auto=format&fit=crop"
                  alt="Craftsmanship"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Behind the Scenes</h3>
              <p className="text-gray-400">
                Witness the dedication and skill that goes into creating each signature piece.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Latest Additions */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Diamond className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold">Latest Additions</h2>
          </div>
          <ProductReel 
            title="Latest Additions"
            subtitle="Newly added signature pieces"
            href="/premium/signature"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 