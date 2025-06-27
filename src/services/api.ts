import type { APIRequest, APIResponse } from '../types';

// src/services/api.ts (在文件末尾增加新的函数)

// ... callRealAPI 函数保持不变 ...

import type { CardData, ProfileData } from '../types';

export const getCards = async (): Promise<CardData[]> => {
    const response = await fetch(`${API_BASE_URL}/cards`);
    return response.json();
};

export const toggleFavorite = async (cardId: string): Promise<CardData> => {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}/favorite`, { method: 'POST' });
    return response.json();
};

export const getProfile = async (): Promise<ProfileData> => {
    const response = await fetch(`${API_BASE_URL}/profile`);
    return response.json();
};

export const updateProfile = async (profileData: ProfileData): Promise<ProfileData> => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
    });
    return response.json();
};

const API_BASE_URL = 'http://localhost:8000/api';

export const callRealAPI = async (request: APIRequest): Promise<APIResponse> => {
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
        console.error("API call failed:", error);
        return { text: `抱歉，连接AI导师时出现了一点问题: ${error}` };
    }
};