import React from 'react';
import './Card.css';

interface CardProps {
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const CardComponent: React.FC<CardProps> = ({
  imageUrl,
  isFlipped,
  isMatched,
  onClick,
  disabled,
}) => {
  return (
    <div
      className={`memo-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="memo-card-inner">
        <div className="memo-card-front">
          <span>?</span>
        </div>
        <div className="memo-card-back">
          <img src={imageUrl} alt="Card" />
        </div>
      </div>
    </div>
  );
};
