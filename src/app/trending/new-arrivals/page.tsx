"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Sparkles, Clock, Calendar, Gift } from 'lucide-react';
import ProductReel from '@/components/ProductReel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const MotionBadge = motion(Badge);

export default function NewArrivalsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <MaxWidthWrapper>
          <div className="flex items-center gap-4 mb-6">
            <Sparkles className="h-10 w-10 text-blue-600" />
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-gray-900">New Arrivals</h1>
              </motion.div>
              <div className="flex gap-2 mt-2">
                <MotionBadge
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  variant="secondary"
                >
                  Just Landed
                </MotionBadge>
                <MotionBadge
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  variant="secondary"
                >
                  Limited Edition
                </MotionBadge>
                <MotionBadge
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  variant="secondary"
                >
                  Exclusive Designs
                </MotionBadge>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg mb-12">
            Be the first to explore our latest collections. Each piece is crafted with precision and passion, bringing you the finest in contemporary jewelry design.
          </p>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Latest Update</p>
                  <p className="text-2xl font-bold">2 Hours Ago</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">New This Week</p>
                  <p className="text-2xl font-bold">25+ Items</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Gift className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Special Offers</p>
                  <p className="text-2xl font-bold">5 Active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-12">
        {/* Just Landed */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Just Landed</h2>
          </div>
          <ProductReel 
            title="Latest Arrivals"
            subtitle="Our newest additions to the collection"
            href="/trending/new-arrivals"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>

        {/* Coming Soon */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="relative overflow-hidden group">
                <CardContent className="p-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold mb-2">Collection {item}</h3>
                    <p className="text-gray-600 mb-4">
                      A stunning new collection coming to our store soon. Be the first to know when it launches.
                    </p>
                    <Badge variant="secondary">Coming in 7 days</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Limited Edition */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Gift className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Limited Edition</h2>
          </div>
          <ProductReel 
            title="Limited Edition"
            subtitle="Exclusive pieces available for a limited time"
            href="/trending/new-arrivals"
            query={{ sort: 'desc', limit: 4 }}
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 