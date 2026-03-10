import { useState, useCallback, useEffect } from 'react';
import type { Card, Game } from '../api/memo.types';

interface UseGameLogicReturn {
  shuffledCards: Card[];
  flippedCards: string[];
  matchedCards: string[];
  moves: number;
  score: number;
  isProcessing: boolean;
  handleCardClick: (cardId: string) => void;
  resetGame: () => void;
}

export const useGameLogic = (
  game: Game | undefined,
  onMove: (card1Id: string, card2Id: string) => Promise<void>,
): UseGameLogicReturn => {
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedCards, setMatchedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstCardId, setFirstCardId] = useState<string | null>(null);

  // Initialize cards when game changes
  useEffect(() => {
    if (!game?.cardSet?.cards) {
      return;
    }

    // API already returns pairs (each card has a pair with same imageUrl)
    // We just need to shuffle them
    const cards = [...game.cardSet.cards];
    
    // Shuffle the cards
    const shuffled = cards.sort(() => Math.random() - 0.5);

    setShuffledCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setScore(0);
    setIsProcessing(false);
    setFirstCardId(null);
  }, [game?.id, game?.cardSet?.cards?.length]);

  const handleCardClick = useCallback(
    async (cardId: string) => {
      if (
        isProcessing ||
        flippedCards.length >= 2 ||
        flippedCards.includes(cardId) ||
        matchedCards.includes(cardId)
      ) {
        return;
      }

      // Flip the card
      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (firstCardId === null) {
        // First card flipped
        setFirstCardId(cardId);
      } else {
        // Second card flipped - make a move
        setIsProcessing(true);
        setMoves((prev) => prev + 1);

        try {
          await onMove(firstCardId, cardId);

          // Check if cards match by comparing imageUrls
          const card1 = shuffledCards.find(c => c.id === firstCardId);
          const card2 = shuffledCards.find(c => c.id === cardId);

          if (card1 && card2 && card1.imageUrl === card2.imageUrl && card1.id !== card2.id) {
            // Match!
            setMatchedCards((prev) => [...prev, firstCardId, cardId]);
            setScore((prev) => prev + 1);
          }

          // Reset for next turn
          setTimeout(() => {
            setFlippedCards([]);
            setFirstCardId(null);
            setIsProcessing(false);
          }, 1000);
        } catch (error) {
          // Error handling - flip cards back
          setTimeout(() => {
            setFlippedCards([]);
            setFirstCardId(null);
            setIsProcessing(false);
          }, 1000);
        }
      }
    },
    [flippedCards, matchedCards, firstCardId, isProcessing, onMove, shuffledCards],
  );

  const resetGame = useCallback(() => {
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setScore(0);
    setIsProcessing(false);
    setFirstCardId(null);
  }, []);

  return {
    shuffledCards,
    flippedCards,
    matchedCards,
    moves,
    score,
    isProcessing,
    handleCardClick,
    resetGame,
  };
};
