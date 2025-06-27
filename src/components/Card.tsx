import React from 'react';
import { Link } from 'react-router-dom';
import type { CardData } from '../types';

interface CardProps {
  card: CardData;
  onToggleFavorite: (cardId: string) => void;
}

const Card: React.FC<CardProps> = ({ card, onToggleFavorite }) => {
  return (
    <div className="card">
      <button onClick={() => onToggleFavorite(card.id)} className="favorite-button">
        {card.isFavorite ? '★' : '☆'}
      </button>
      <Link to={`/chat/${card.id}`}>
        <h2>{card.title}</h2>
        <p>{card.description}</p>
      </Link>
    </div>
  );
};
export default Card;