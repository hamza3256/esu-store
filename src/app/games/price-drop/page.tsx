"use client";

import { useState, useEffect, useRef } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { DollarSign, Timer, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  price: number;
  minPrice: number;
  basePrice: number;
  image: string;
  name: string;
  caught: boolean;
}

const ITEMS = [
  { name: 'Diamond Ring', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop', basePrice: 1000, minPrice: 400 },
  { name: 'Gold Necklace', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop', basePrice: 800, minPrice: 300 },
  { name: 'Pearl Earrings', image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop', basePrice: 500, minPrice: 200 },
  { name: 'Silver Bracelet', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2940&auto=format&fit=crop', basePrice: 300, minPrice: 100 },
];

export default function PriceDropPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [basketPosition, setBasketPosition] = useState(50);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const initializeGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    setFallingItems([]);
  };

  const spawnItem = () => {
    if (!gameStarted) return;

    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const newItem: FallingItem = {
      id: Date.now(),
      x: Math.random() * 80 + 10, // 10-90%
      y: -10,
      speed: Math.random() * 1 + 0.5,
      price: randomItem.basePrice,
      minPrice: randomItem.minPrice,
      basePrice: randomItem.basePrice,
      image: randomItem.image,
      name: randomItem.name,
      caught: false,
    };

    setFallingItems((prev) => [...prev, newItem]);
  };

  const moveBasket = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || !gameStarted) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketPosition(Math.max(10, Math.min(90, x)));
  };

  const catchItem = (item: FallingItem) => {
    if (item.caught) return;

    const itemCenter = item.x;
    const basketRange = 15; // Basket width range

    if (
      Math.abs(itemCenter - basketPosition) < basketRange &&
      item.y > 70 && // Only catch items near the bottom
      item.y < 90 // Don't catch items that have fallen too far
    ) {
      setFallingItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, caught: true } : i
        )
      );

      // Calculate score based on how close to minimum price
      const priceRange = item.price - item.minPrice;
      const scoreBonus = Math.round((1 - (item.price - item.minPrice) / priceRange) * 100);
      setScore((prev) => prev + scoreBonus);
    }
  };

  useEffect(() => {
    let gameLoop: NodeJS.Timeout;
    let spawnLoop: NodeJS.Timeout;

    if (gameStarted && timeLeft > 0) {
      // Main game loop
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

      // Spawn new items periodically
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
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              Price Drop Catcher
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Catch falling jewelry at their best price! The longer they fall, the cheaper they get - but don&apos;t wait too long!
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Timer className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-sm text-gray-300">Time Left</p>
                  <p className="text-2xl font-bold">{Math.ceil(timeLeft)}s</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-sm text-gray-300">Score</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">High Score</p>
                  <p className="text-2xl font-bold">{highScore}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative aspect-[16/9] bg-gradient-to-br from-green-800/20 to-black/20 rounded-lg overflow-hidden border border-green-500/20 mb-8 cursor-none"
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
                <ShoppingBag className="w-full h-full text-green-400" />
              </motion.div>
            )}

            {!gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={initializeGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg"
                >
                  {score > 0 ? 'Play Again' : 'Start Game'}
                </Button>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <Card className="bg-white/5 border-green-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">How to Play</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Move your basket to catch falling jewelry
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Prices drop as items fall - time your catch!
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Score more points for catching at lower prices
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Don&apos;t let items fall off the screen
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 