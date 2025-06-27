import React from 'react';
import { Link } from 'react-router-dom';
import type { CardData } from '../types';

interface CardProps {
  card: CardData;
  onToggleFavorite: (cardId: string) => void;
}

const getRandomImage = (id: string) =>
  `https://source.unsplash.com/random/400x${280 + (parseInt(id, 36) % 80)}?sig=${id}`;

const Card: React.FC<CardProps> = ({ card, onToggleFavorite }) => {
  const imageUrl = card.imageUrl || getRandomImage(card.id);
  const cardStyle = {
    backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
      url(${imageUrl})
    `,
  };

  return (
    <div className="card" style={cardStyle}>
      <div className="card-content">
        <Link to={`/chat/${card.id}`}>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
        </Link>
      </div>
      <div className="card-actions">
        <button 
          onClick={() => onToggleFavorite(card.id)} 
          className="favorite-button"
          aria-label={card.isFavorite ? '取消收藏' : '收藏'}
        >
          {card.isFavorite ? '★' : '☆'}
        </button>
        <Link to={`/chat/${card.id}`} className="card-link">
          开始学习 →
        </Link>
      </div>
    </div>
  );
};
export default Card;