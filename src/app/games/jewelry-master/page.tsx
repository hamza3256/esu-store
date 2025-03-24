"use client";

import { useState, useEffect, useRef } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Diamond, Timer, Star, Trophy, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface JewelryItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  price: number;
  minPrice: number;
  basePrice: number;
  image: string;
  name: string;
  type: 'ring' | 'necklace' | 'earrings' | 'bracelet';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  caught: boolean;
  matched: boolean;
}

const JEWELRY_TYPES = {
  ring: {
    name: 'Ring',
    basePrice: 1000,
    minPrice: 400,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop',
  },
  necklace: {
    name: 'Necklace',
    basePrice: 800,
    minPrice: 300,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop',
  },
  earrings: {
    name: 'Earrings',
    basePrice: 500,
    minPrice: 200,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop',
  },
  bracelet: {
    name: 'Bracelet',
    basePrice: 300,
    minPrice: 100,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2940&auto=format&fit=crop',
  },
};

const RARITY_MULTIPLIERS = {
  common: 1,
  rare: 1.5,
  epic: 2,
  legendary: 3,
};

export default function JewelryMasterPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [fallingItems, setFallingItems] = useState<JewelryItem[]>([]);
  const [basketPosition, setBasketPosition] = useState(50);
  const [collectedSet, setCollectedSet] = useState<Set<JewelryItem['type']>>(new Set());
  const [combo, setCombo] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const initializeGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    setFallingItems([]);
    setCollectedSet(new Set());
    setCombo(0);
  };

  const spawnItem = () => {
    if (!gameStarted) return;

    const types = Object.keys(JEWELRY_TYPES) as JewelryItem['type'][];
    const type = types[Math.floor(Math.random() * types.length)];
    const rarity = Math.random() < 0.1 ? 'legendary' : 
                   Math.random() < 0.2 ? 'epic' : 
                   Math.random() < 0.3 ? 'rare' : 'common';

    const newItem: JewelryItem = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: -10,
      speed: Math.random() * 1 + 0.5,
      price: JEWELRY_TYPES[type].basePrice * RARITY_MULTIPLIERS[rarity],
      minPrice: JEWELRY_TYPES[type].minPrice * RARITY_MULTIPLIERS[rarity],
      basePrice: JEWELRY_TYPES[type].basePrice * RARITY_MULTIPLIERS[rarity],
      image: JEWELRY_TYPES[type].image,
      name: `${JEWELRY_TYPES[type].name} (${rarity})`,
      type,
      rarity,
      caught: false,
      matched: false,
    };

    setFallingItems((prev) => [...prev, newItem]);
  };

  const moveBasket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || !gameStarted) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketPosition(Math.max(10, Math.min(90, x)));
  };

  const catchItem = (item: JewelryItem) => {
    if (item.caught) return;

    const itemCenter = item.x;
    const basketRange = 15;

    if (
      Math.abs(itemCenter - basketPosition) < basketRange &&
      item.y > 70 &&
      item.y < 90
    ) {
      setFallingItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, caught: true } : i
        )
      );

      // Calculate score based on price and rarity
      const priceRange = item.price - item.minPrice;
      const scoreBonus = Math.round((1 - (item.price - item.minPrice) / priceRange) * 100 * RARITY_MULTIPLIERS[item.rarity]);
      
      // Check for set completion
      const newCollectedSet = new Set(collectedSet);
      newCollectedSet.add(item.type);
      setCollectedSet(newCollectedSet);

      // Calculate combo
      if (newCollectedSet.size === 4) {
        setCombo((prev) => prev + 1);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
        });
        // Reset set
        setCollectedSet(new Set());
      }

      setScore((prev) => prev + scoreBonus);
    }
  };

  useEffect(() => {
    let gameLoop: NodeJS.Timeout;
    let spawnLoop: NodeJS.Timeout;

    if (gameStarted && timeLeft > 0) {
      gameLoop = setInterval(() => {
        setFallingItems((prev) =>
          prev
            .map((item) => ({
              ...item,
              y: item.y + item.speed,
              price: Math.max(
                item.minPrice,
                item.price - (item.basePrice - item.minPrice) * 0.02
              ),
            }))
            .filter((item) => item.y < 100)
        );
        setTimeLeft((prev) => prev - 0.1);
      }, 100);

      spawnLoop = setInterval(spawnItem, 2000);
    } else if (timeLeft <= 0) {
      setGameStarted(false);
      if (score > highScore) {
        setHighScore(score);
      }
    }

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawnLoop);
    };
  }, [gameStarted, timeLeft, score, highScore, spawnItem]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Diamond className="h-8 w-8 text-purple-400" />
              Jewelry Master
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Collect matching jewelry sets while catching the best deals! Complete sets for bonus points and unlock special rewards.
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Timer className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-300">Time Left</p>
                  <p className="text-2xl font-bold">{Math.ceil(timeLeft)}s</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Diamond className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-300">Score</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">High Score</p>
                  <p className="text-2xl font-bold">{highScore}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">Combo</p>
                  <p className="text-2xl font-bold">{combo}x</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative aspect-[16/9] bg-gradient-to-br from-purple-800/20 to-black/20 rounded-lg overflow-hidden border border-purple-500/20 mb-8 cursor-none"
            onMouseMove={moveBasket}
          >
            <AnimatePresence>
              {gameStarted && fallingItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="absolute w-16 h-16"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  onClick={() => catchItem(item)}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs">
                      ${Math.round(item.price)}
                    </div>
                    <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs ${
                      item.rarity === 'legendary' ? 'bg-yellow-500' :
                      item.rarity === 'epic' ? 'bg-purple-500' :
                      item.rarity === 'rare' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {item.type}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Basket */}
            {gameStarted && (
              <motion.div
                className="absolute bottom-4 w-20 h-20 transform -translate-x-1/2"
                style={{ left: `${basketPosition}%` }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ShoppingBag className="w-full h-full text-purple-400" />
              </motion.div>
            )}

            {!gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={initializeGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg"
                >
                  {score > 0 ? 'Play Again' : 'Start Game'}
                </Button>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">How to Play</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-purple-400" />
                  Move your basket to catch falling jewelry
                </li>
                <li className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-purple-400" />
                  Collect matching sets (ring, necklace, earrings, bracelet) for bonus points
                </li>
                <li className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-purple-400" />
                  Higher rarity items are worth more points
                </li>
                <li className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-purple-400" />
                  Complete sets to build up your combo multiplier
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 