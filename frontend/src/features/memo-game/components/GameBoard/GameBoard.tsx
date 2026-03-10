import React from 'react';
import { CardComponent } from '../Card/Card';
import type { Card as CardType } from '../../api/memo.types';
import './GameBoard.css';

interface GameBoardProps {
  cards: CardType[];
  flippedCards: string[];
  matchedCards: string[];
  onCardClick: (cardId: string) => void;
  disabled: boolean;
  gridRows?: number;
  gridCols?: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  flippedCards,
  matchedCards,
  onCardClick,
  disabled,
  gridRows = 4,
  gridCols = 3,
}) => {
  const gridClass = `grid-${gridRows}x${gridCols}`;
  
  return (
    <div className={`memo-game-board ${gridClass}`}>
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          imageUrl={card.imageUrl}
          isFlipped={flippedCards.includes(card.id)}
          isMatched={matchedCards.includes(card.id)}
          onClick={() => onCardClick(card.id)}
          disabled={
            disabled ||
            flippedCards.includes(card.id) ||
            matchedCards.includes(card.id)
          }
        />
      ))}
    </div>
  );
};
