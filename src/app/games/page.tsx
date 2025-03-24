"use client";

import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Trophy, Gift, Crown, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  {
    id: 'jewelry-master',
    title: 'Jewelry Master',
    description: 'Test your knowledge of precious stones and jewelry. Match gems, identify cuts, and become a jewelry expert!',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
    difficulty: 'Medium',
    rewards: 'Up to 100 points',
    isNew: true,
  },
  {
    id: 'diamond-rush',
    title: 'Diamond Rush',
    description: 'Race against time to match diamond cuts and collect precious stones. The faster you match, the more points you earn!',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
    difficulty: 'Hard',
    rewards: 'Up to 150 points',
    isNew: false,
  },
  {
    id: 'gem-puzzle',
    title: 'Gem Puzzle',
    description: 'Arrange precious stones in the correct order to create beautiful jewelry patterns. A relaxing puzzle game for jewelry lovers!',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
    difficulty: 'Easy',
    rewards: 'Up to 80 points',
    isNew: false,
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Header */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-purple-500/20 rounded-2xl" />
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-4">
                <Gamepad2 className="h-8 w-8 text-gold-500" />
                <h1 className="text-4xl font-bold text-gold-500">Games & Rewards</h1>
              </div>
              <p className="text-gray-300 max-w-2xl">
                Play exciting games, earn points, and unlock exclusive rewards. Challenge yourself with our collection of jewelry-themed games!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Trophy className="h-8 w-8 text-gold-500" />
                  <div>
                    <p className="text-2xl font-bold text-gold-500">1,250</p>
                    <p className="text-gray-300">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Crown className="h-8 w-8 text-gold-500" />
                  <div>
                    <p className="text-2xl font-bold text-gold-500">3</p>
                    <p className="text-gray-300">Games Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Gift className="h-8 w-8 text-gold-500" />
                  <div>
                    <p className="text-2xl font-bold text-gold-500">2</p>
                    <p className="text-gray-300">Rewards Unlocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <Card className="group bg-white/5 border border-white/10 hover:border-gold-500/50 transition-colors duration-300">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {game.isNew && (
                      <div className="absolute top-4 right-4 bg-gold-500 text-black px-2 py-1 rounded-full text-sm font-medium">
                        New
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-gold-500">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gold-500" />
                        <span className="text-sm text-gray-300">{game.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gold-500" />
                        <span className="text-sm text-gold-500">{game.rewards}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Rewards Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gold-500 mb-6">Available Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500">
                      <Image
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop"
                        alt="Discount"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gold-500">10% Off Next Purchase</h3>
                      <p className="text-sm text-gray-300">Unlock at 500 points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500">
                      <Image
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop"
                        alt="Free Shipping"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gold-500">Free Shipping</h3>
                      <p className="text-sm text-gray-300">Unlock at 1000 points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500">
                      <Image
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop"
                        alt="VIP Access"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gold-500">VIP Access</h3>
                      <p className="text-sm text-gray-300">Unlock at 2000 points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 