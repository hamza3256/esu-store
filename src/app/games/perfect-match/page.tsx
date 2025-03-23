"use client";

import { useState, useEffect } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Heart, Timer, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface JewelryCard {
  id: number;
  type: string;
  setId: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const JEWELRY_SETS = [
  { type: 'Necklace', setId: 1, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2940&auto=format&fit=crop' },
  { type: 'Earrings', setId: 1, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=2940&auto=format&fit=crop' },
  { type: 'Ring', setId: 2, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=2940&auto=format&fit=crop' },
  { type: 'Bracelet', setId: 2, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2940&auto=format&fit=crop' },
  { type: 'Pendant', setId: 3, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2940&auto=format&fit=crop' },
  { type: 'Anklet', setId: 3, image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2940&auto=format&fit=crop' },
];

export default function PerfectMatchPage() {
  const [cards, setCards] = useState<JewelryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number>(Infinity);

  const initializeGame = () => {
    const duplicatedCards = [...JEWELRY_SETS, ...JEWELRY_SETS].map((card, index) => ({
      ...card,
      id: index,
      isFlipped: false,
      isMatched: false,
    }));

    // Shuffle cards
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || flippedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    setMoves((prev) => prev + 1);

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.setId === secondCard.setId) {
        // Match found
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (matchedPairs === JEWELRY_SETS.length) {
      if (moves < bestScore) {
        setBestScore(moves);
      }
      setGameStarted(false);
    }
  }, [matchedPairs, moves, bestScore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900 to-black text-white">
      <MaxWidthWrapper>
        <div className="py-12">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Heart className="h-8 w-8 text-pink-400" />
              Perfect Match
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Match complementary jewelry pieces to create stunning sets and unlock exclusive bundle deals!
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-pink-400" />
                <div>
                  <p className="text-sm text-gray-300">Moves</p>
                  <p className="text-2xl font-bold">{moves}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Heart className="h-6 w-6 text-pink-400" />
                <div>
                  <p className="text-sm text-gray-300">Matches</p>
                  <p className="text-2xl font-bold">{matchedPairs}/{JEWELRY_SETS.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">Best Score</p>
                  <p className="text-2xl font-bold">{bestScore === Infinity ? '-' : bestScore}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Area */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="aspect-square"
                >
                  <Card
                    className={`h-full cursor-pointer transition-all duration-500 transform ${
                      card.isMatched ? 'opacity-50' : ''
                    }`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <CardContent className="p-0 h-full relative">
                      {(card.isMatched || flippedCards.includes(card.id)) ? (
                        <div className="absolute inset-0">
                          <Image
                            src={card.image}
                            alt={card.type}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                            <p className="text-white font-semibold">{card.type}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <Heart className="h-8 w-8 text-pink-400 animate-pulse" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Start/Restart Button */}
          <div className="text-center">
            <Button
              onClick={initializeGame}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full text-lg"
            >
              {gameStarted ? 'Restart Game' : 'Start Game'}
            </Button>
          </div>

          {/* Game Instructions */}
          <Card className="bg-white/5 border-pink-500/20 mt-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">How to Play</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Click cards to reveal jewelry pieces
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Match pairs of complementary pieces
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Complete sets to unlock bundle discounts
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Try to win in fewer moves for better rewards
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </div>
  );
} 