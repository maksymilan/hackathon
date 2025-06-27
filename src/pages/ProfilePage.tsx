// src/pages/ProfilePage.tsx (最终功能完整版)

import React, { useState, useEffect } from 'react';
import { updateProfile, getCards, toggleFavorite } from '../services/api';
import type { CardData } from '../types';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext'; // 引入 useUser
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 可供选择的兴趣领域
const INTEREST_OPTIONS = ["Python", "数据科学", "Web开发", "游戏开发", "网络爬虫", "人工智能"];

const ProfilePage: React.FC = () => {
  const { profile, isLoading: isProfileLoading, refreshProfile } = useUser(); // 从Context获取用户数据
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [editableProfile, setEditableProfile] = useState(profile);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // 当 context 中的 profile 更新时，同步到可编辑状态
    setEditableProfile(profile);
  }, [profile]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsCardsLoading(true);
        const cardsData = await getCards();
        setCards(cardsData);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      } finally {
        setIsCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableProfile) return;
    setEditableProfile({ ...editableProfile, [e.target.name]: e.target.value });
  };

  const handleInterestChange = (interest: string) => {
    if (!editableProfile) return;
    const newInterests = editableProfile.interests.includes(interest)
      ? editableProfile.interests.filter(i => i !== interest)
      : [...editableProfile.interests, interest];
    setEditableProfile({ ...editableProfile, interests: newInterests });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableProfile) return;
    setStatusMessage('正在保存...');
    try {
      await updateProfile(editableProfile);
      setStatusMessage('个人资料已成功保存！');
      refreshProfile(); // 关键：保存成功后，调用 context 的刷新方法
    } catch (error) {
      setStatusMessage('保存失败，请重试。');
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    try {
        await toggleFavorite(cardId);
        const cardsData = await getCards();
        setCards(cardsData);
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
    }
  };

  if (isProfileLoading || isCardsLoading) {
    return <div className="page-container">加载中...</div>;
  }

  if (!profile || !editableProfile) {
    return <div className="page-container">{statusMessage || "无法加载个人资料。"}</div>;
  }

  return (
    <div className="page-container profile-page">
      <h1>个人中心</h1>
      <form onSubmit={handleSaveProfile} className="profile-form">
        <div className="form-group">
          <label htmlFor="nickname">昵称</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={editableProfile.nickname || username || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="avatar">头像 (URL)</label>
          <input
            type="text"
            id="avatar"
            name="avatar"
            value={editableProfile.avatar}
            onChange={handleInputChange}
            placeholder="请输入图片URL"
          />
        </div>
        <div className="form-group">
          <label>感兴趣的领域</label>
          <div className="interest-tags">
            {INTEREST_OPTIONS.map(interest => (
              <label key={interest} className="interest-tag">
                <input
                  type="checkbox"
                  checked={editableProfile.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="save-button">保存更改</button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>
      <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>退出登录</button>

      <h2 className="favorites-title">我收藏的学习卡片</h2>
      <div className="card-container">
        {cards.filter(c => c.isFavorite).map(card => (
          <Card key={card.id} card={card} onToggleFavorite={handleToggleFavorite} />
        ))}
        {cards.filter(c => c.isFavorite).length === 0 && <p>你还没有收藏任何卡片，快去主页看看吧！</p>}
      </div>
    </div>
  );
};

export default ProfilePage;