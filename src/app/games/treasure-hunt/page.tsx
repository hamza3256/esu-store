"use client";

import { useState, useEffect } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Diamond, Timer, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Gem {
  id: number;
  found: boolean;
  position: { x: number; y: number };
  value: number;
  color: string;
}

export default function TreasureHuntPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState<Gem[]>([]);
  const [highScore, setHighScore] = useState(0);

  const initializeGame = () => {
    const newGems = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      found: false,
      position: {
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10, // 10-90%
      },
      value: Math.floor(Math.random() * 50) + 10,
      color: ['text-blue-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400'][
        Math.floor(Math.random() * 4)
      ],
    }));
    setGems(newGems);
    setTimeLeft(60);
    setScore(0);
    setGameStarted(true);
  };

  const handleGemClick = (gemId: number) => {
    if (!gameStarted) return;

    setGems((prevGems) =>
      prevGems.map((gem) =>
        gem.id === gemId && !gem.found
          ? { ...gem, found: true }
          : gem
      )
    );

    const gem = gems.find((g) => g.id === gemId);
    if (gem && !gem.found) {
      setScore((prev) => prev + gem.value);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameStarted(false);
      if (score > highScore) {
        setHighScore(score);
      }
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, score, highScore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Diamond className="h-8 w-8 text-purple-400" />
              Treasure Hunt
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Find hidden gems before time runs out! Click on the sparkling spots to discover valuable jewelry and unlock exclusive flash deals.
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Timer className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-300">Time Left</p>
                  <p className="text-2xl font-bold">{timeLeft}s</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400" />
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
          </div>

          {/* Game Area */}
          <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-800/20 to-black/20 rounded-lg overflow-hidden border border-purple-500/20 mb-8">
            <AnimatePresence>
              {gameStarted && gems.map((gem) => (
                <motion.button
                  key={gem.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: gem.found ? 0 : 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute ${gem.color} cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                  style={{
                    left: `${gem.position.x}%`,
                    top: `${gem.position.y}%`,
                  }}
                  onClick={() => handleGemClick(gem.id)}
                  disabled={gem.found}
                >
                  <Diamond className="h-8 w-8 animate-pulse" />
                </motion.button>
              ))}
            </AnimatePresence>
            
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
                  Click on sparkling gems to collect them
                </li>
                <li className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-purple-400" />
                  Find as many gems as possible in 60 seconds
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  Each gem has a different point value
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  Beat your high score to unlock better rewards
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 