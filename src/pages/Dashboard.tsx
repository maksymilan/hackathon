import React, { useState, useEffect } from 'react';
import { getCards, toggleFavorite } from '../services/api';
import type { CardData } from '../types';
import Card from '../components/Card';
import WelcomeAnimation from '../components/WelcomeAnimation';
import ProgressIndicator from '../components/ProgressIndicator';
import Notification from '../components/Notification';
import Masonry from 'react-masonry-css';

// 准备一组高质量的背景图URL
const imagePool = [
  "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1571171637578-41bc215526d8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb"
];

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否是首次访问
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
    
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const cardsData = await getCards();
      // 为每张卡片随机分配一张图片
      const cardsWithImages = cardsData.map((card, index) => ({
        ...card,
        imageUrl: imagePool[index % imagePool.length]
      }));
      setCards(cardsWithImages);
    } catch (error) {
      showNotification('error', '加载学习卡片失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    try {
      const updatedCard = await toggleFavorite(cardId);
      setCards(prevCards => 
        prevCards.map(c => c.id === cardId ? updatedCard : c)
      );
      showNotification(
        updatedCard.isFavorite ? 'favorite' : 'unfavorite',
        updatedCard.isFavorite ? '已添加到收藏' : '已取消收藏'
      );
    } catch (error) {
      showNotification('error', '操作失败，请稍后重试');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const favoriteCards = cards.filter(card => card.isFavorite);
  const completedCards = cards.filter(card => card.isFavorite);

  // Masonry断点配置
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>探索学习领域</h1>
        <div className="card-container">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card skeleton">
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeAnimation onComplete={handleWelcomeComplete} />}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={handleNotificationClose}
        />
      )}
      <div className="page-container">
        <h1>探索学习领域</h1>
        
        {/* 进度指示器 */}
        <div style={{ marginBottom: '2rem' }}>
          <ProgressIndicator
            current={completedCards.length}
            total={cards.length}
            label="学习进度"
          />
          {favoriteCards.length > 0 && (
            <ProgressIndicator
              current={favoriteCards.length}
              total={cards.length}
              label="收藏数量"
              showPercentage={false}
            />
          )}
        </div>

        {/* 学习卡片 Masonry 布局 */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="card-masonry"
          columnClassName="card-masonry-column"
        >
          {cards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">暂无学习内容</div>
              <div className="empty-state-description">
                请稍后再来查看，我们正在为您准备精彩的学习内容
              </div>
            </div>
          ) : (
            cards.map(card => (
              <Card key={card.id} card={card} onToggleFavorite={handleToggleFavorite} />
            ))
          )}
        </Masonry>
      </div>
    </>
  );
};
export default Dashboard; 