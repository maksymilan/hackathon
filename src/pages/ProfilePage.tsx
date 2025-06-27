// src/pages/ProfilePage.tsx (最终功能完整版)

import React, { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile, getCards, toggleFavorite } from '../services/api';
import type { ProfileData, CardData } from '../types';
import Card from '../components/Card'; // 复用我们之前创建的卡片组件

// 可供选择的兴趣领域
const INTEREST_OPTIONS = ["Python", "数据科学", "Web开发", "游戏开发", "网络爬虫", "人工智能"];

const ProfilePage: React.FC = () => {
  // --- State Management ---
  // 用于存储从后端获取的原始数据
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  // 用于绑定表单的临时编辑状态
  const [editableProfile, setEditableProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 并发获取个人资料和卡片列表
      const [profileData, cardsData] = await Promise.all([
        getProfile(),
        getCards()
      ]);
      setProfile(profileData);
      setEditableProfile(profileData); // 初始化可编辑的profile
      setCards(cardsData);
    } catch (error) {
      console.error("Failed to fetch page data:", error);
      setStatusMessage("数据加载失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Event Handlers ---
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
      const updatedProfile = await updateProfile(editableProfile);
      setProfile(updatedProfile);
      setEditableProfile(updatedProfile);
      setStatusMessage('个人资料已成功保存！');
    } catch (error) {
      setStatusMessage('保存失败，请重试。');
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    try {
        await toggleFavorite(cardId);
        // 重新获取所有卡片数据以刷新收藏状态
        const cardsData = await getCards();
        setCards(cardsData);
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
    }
  };


  // --- Render Logic ---
  if (isLoading) {
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
            value={editableProfile.nickname}
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