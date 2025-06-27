// src/services/api.ts (已修复和重构)

import type { APIRequest, APIResponse, CardData, ProfileData } from '../types';

// 1. 将API地址定义在文件顶部
const API_BASE_URL = 'http://localhost:8000/api';

// 2. 统一的聊天API调用函数
export const callChatAPI = async (request: APIRequest): Promise<APIResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'API request failed');
        }
        return await response.json();
    } catch (error) {
        console.error("Chat API call failed:", error);
        return { 
            text: `抱歉，连接AI导师时出现了一点问题: ${error}`,
            // 出错时返回空数组，防止UI崩溃
            learningPath: [], 
            chatHistory: [] 
        };
    }
};

// 3. 其他独立的API调用函数
export const getCards = async (): Promise<CardData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/cards`);
        if (!response.ok) throw new Error('Failed to fetch cards');
        return await response.json(); // 修复了这里，正确解析JSON
    } catch (error) {
        console.error("Get cards failed:", error);
        return []; // 出错时返回空数组
    }
};

export const toggleFavorite = async (cardId: string): Promise<CardData | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}/favorite`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to toggle favorite');
        return await response.json();
    } catch (error) {
        console.error("Toggle favorite failed:", error);
        return null;
    }
};

export const getProfile = async (): Promise<ProfileData | null> => {
    // 优先从 localStorage 读取
    const local = localStorage.getItem('profile-local');
    if (local) {
        try {
            return JSON.parse(local);
        } catch {
            // ignore parse error, fallback to backend
        }
    }
    try {
        const response = await fetch(`${API_BASE_URL}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error("Get profile failed:", error);
        return null;
    }
};

export const updateProfile = async (profileData: ProfileData): Promise<ProfileData | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return await response.json();
    } catch (error) {
        console.error("Update profile failed:", error);
        return null;
    }
};
