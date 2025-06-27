import React, { useState, useEffect } from 'react';
import { getCards, toggleFavorite } from '../services/api';
import type { CardData } from '../types';
import Card from '../components/Card';

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    getCards().then(setCards);
  }, []);

  const handleToggleFavorite = (cardId: string) => {
    toggleFavorite(cardId).then(updatedCard => {
      setCards(prevCards => 
        prevCards.map(c => c.id === cardId ? updatedCard : c)
      );
    });
  };

  return (
    <div className="page-container">
      <h1>探索学习领域</h1>
      <div className="card-container">
        {cards.map(card => (
          <Card key={card.id} card={card} onToggleFavorite={handleToggleFavorite} />
        ))}
      </div>
    </div>
  );
};
export default Dashboard;