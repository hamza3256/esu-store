"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond, Sparkles, Trophy, Crown, Gamepad2, ShoppingBag, TrendingUp, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const FEATURED_GAMES = [
  {
    title: 'Jewelry Master',
    description: 'Catch falling jewelry and complete sets for bonus points!',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
    href: '/games/jewelry-master',
    icon: Diamond,
  },
  {
    title: 'Price Drop',
    description: 'Watch prices fall and grab the best deals!',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop',
    href: '/games/price-drop',
    icon: TrendingUp,
  },
  {
    title: 'Treasure Hunt',
    description: 'Find hidden treasures and unlock exclusive rewards!',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop',
    href: '/games/treasure-hunt',
    icon: Crown,
  },
];

const TRENDING_ITEMS = [
  {
    name: 'Diamond Eternity Ring',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
    category: 'Rings',
    discount: 15,
  },
  {
    name: 'Pearl Necklace',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop',
    category: 'Necklaces',
    discount: 20,
  },
  {
    name: 'Sapphire Earrings',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop',
    category: 'Earrings',
    discount: 10,
  },
];

const COLLECTIONS = [
  {
    name: 'Summer Collection',
    description: 'Light and breezy pieces for the summer season',
    image: 'https://images.unsplash.com/photo-1576016770956-debb63d92058?q=80&w=2940&auto=format&fit=crop',
  },
  {
    name: 'Wedding Series',
    description: 'Elegant jewelry for your special day',
    image: 'https://images.unsplash.com/photo-1587613990444-68fe88ee970a?q=80&w=2940&auto=format&fit=crop',
  },
  {
    name: 'Minimalist Edit',
    description: 'Simple, sophisticated designs for everyday wear',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=2940&auto=format&fit=crop',
  },
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-400" />
              Discover
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore our interactive games, trending items, and exclusive collections. Play to earn rewards and unlock special discounts!
            </p>
          </div>

          {/* Featured Games */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-purple-400" />
              Featured Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_GAMES.map((game) => (
                <Link href={game.href} key={game.title}>
                  <Card className="bg-white/5 hover:bg-white/10 transition-colors border-purple-500/20 overflow-hidden group">
                    <div className="relative h-48">
                      <Image
                        src={game.image}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <game.icon className="h-5 w-5 text-purple-400" />
                          {game.title}
                        </h3>
                        <p className="text-sm text-gray-300">{game.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Now */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRENDING_ITEMS.map((item) => (
                <Card key={item.name} className="bg-white/5 border-purple-500/20 overflow-hidden group">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-2 py-1 rounded-full text-sm">
                      {item.discount}% OFF
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-gray-300 text-sm">{item.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-lg">${item.price}</p>
                      <Button size="sm" variant="secondary">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Collections */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Gift className="h-6 w-6 text-purple-400" />
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLLECTIONS.map((collection) => (
                <Card key={collection.name} className="bg-white/5 border-purple-500/20 overflow-hidden group">
                  <div className="relative h-48">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-semibold mb-1">{collection.name}</h3>
                      <p className="text-sm text-gray-300">{collection.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Rewards Banner */}
          <section>
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none overflow-hidden">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    Earn Rewards While You Shop
                  </h2>
                  <p className="text-gray-100 max-w-xl">
                    Play our interactive games, complete collections, and unlock exclusive discounts. The more you play, the more you save!
                  </p>
                </div>
                <Button size="lg" variant="secondary" className="whitespace-nowrap">
                  Start Playing
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 