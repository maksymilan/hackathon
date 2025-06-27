// src/pages/ChatSpace.tsx (本地存储最终版)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import LearningPath from '../components/LearningPath';
import type { ChatMessage, LearningPathItem, ChatHistories } from '../types';
import { callChatAPI } from '../services/api'; // 使用我们统一的聊天API

// --- 新增：定义用于本地存储的键名 ---
const LOCAL_STORAGE_KEY_PREFIX = 'ai-tutor-session-';

const ChatSpace: React.FC = () => {
    const { topic } = useParams<{ topic: string }>();
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${topic}`; // 为每个主题创建唯一的存储键

    // --- 核心修改 1: 从localStorage惰性初始化State ---
    // useState现在接收一个函数，这个函数只在组件初次渲染时执行一次。
    const [learningPath, setLearningPath] = useState<LearningPathItem[]>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved).learningPath || [] : [];
    });
    const [chatHistories, setChatHistories] = useState<ChatHistories>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved).chatHistories || {} : {};
    });
    const [currentTopicId, setCurrentTopicId] = useState<number | null>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved).currentTopicId || null : null;
    });

    const [isThinking, setIsThinking] = useState(false);
    
    // 根据当前主题ID，获取要显示的聊天记录
    const currentMessages = currentTopicId ? chatHistories[currentTopicId] || [] : chatHistories[0] || [];

    // --- 核心修改 2: 使用useEffect在状态变化时自动保存到localStorage ---
    useEffect(() => {
        // 当路径、聊天记录或当前主题ID变化时，保存整个会话状态
        const sessionState = {
            learningPath,
            chatHistories,
            currentTopicId,
        };
        // 只有在路径生成后才开始保存，避免保存初始的空状态
        if (learningPath.length > 0 || Object.keys(chatHistories).length > 1 || (chatHistories[0] && chatHistories[0].length > 1)) {
           localStorage.setItem(storageKey, JSON.stringify(sessionState));
        }
    }, [learningPath, chatHistories, currentTopicId, storageKey]);


    // 初始化逻辑：仅当localStorage中没有任何记录时才执行
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (!saved) {
            initialize();
        }
    }, [topic, storageKey]); // 依赖topic和storageKey，确保切换主题时能正确初始化


    const initialize = () => {
        const greeting: ChatMessage = {
            id: Date.now(),
            sender: 'ai',
            text: `你好！欢迎来到${topic}学习空间！请告诉我你的学习目标，我会为你量身打造学习路径。`
        };
        setLearningPath([]);
        setCurrentTopicId(null);
        setChatHistories({ 0: [greeting] }); // topicId 0 代表初始的 "规划" 聊天
    };

    const handleReset = async () => {
        // --- 核心修改 3: 重置时清除localStorage ---
        localStorage.removeItem(storageKey);
        // 调用后端的/reset接口
        await fetch('http://localhost:8000/api/reset', { method: 'POST' });
        // 重新初始化前端状态
        initialize();
    };

    // ... handleUserSubmit 和 handlePathItemClick 函数保持不变 ...
    const handleUserSubmit = async (text: string) => {
        const topicIdToSubmit = currentTopicId || 0;
        const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };
        
        setChatHistories(prev => ({
            ...prev,
            [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newUserMessage]
        }));
        setIsThinking(true);
        
        const response = await callChatAPI({ type: 'message', text });
        
        setIsThinking(false);

        if (response.learningPath) {
            setLearningPath(response.learningPath);
        }
        
        if (response.chatHistory) {
            setChatHistories(prev => ({...prev, [topicIdToSubmit]: response.chatHistory!}));
        } else {
            const newAiMessage: ChatMessage = {id: Date.now(), text: response.text, sender: 'ai'};
            setChatHistories(prev => ({
                ...prev,
                [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newAiMessage]
            }));
        }
    };
  
    const handlePathItemClick = async (item: LearningPathItem) => {
        if (item.id === currentTopicId) return;

        setIsThinking(true);
        const response = await callChatAPI({ type: 'path_click', topicId: item.id });
        setIsThinking(false);

        setCurrentTopicId(item.id);

        if (response.learningPath) setLearningPath(response.learningPath);
        if (response.chatHistory) {
            setChatHistories(prev => ({...prev, [item.id]: response.chatHistory!}));
        }
    };

    // --- Render Logic 不变 ---
    return (
        <div className="app-layout">
            <LearningPath
                path={learningPath}
                onItemClick={handlePathItemClick}
                currentTopicId={currentTopicId} 
            />
            <main className="chat-container">
                <div className="chat-header">
                    <h2>{topic} 学习空间</h2>
                    <button onClick={handleReset} className="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        新会话
                    </button>
                </div>
                <ChatWindow
                  messages={currentMessages} 
                  onSubmit={handleUserSubmit} 
                  isThinking={isThinking} 
                  assistantName={`${topic}学习助手`} 
                />
            </main>
            <aside className="toolbox">
                <h2>工具箱</h2>
                <div className="tool-placeholder"><p>知识库文档 (即将推出)</p></div>
            </aside>
        </div>
    );
};

export default ChatSpace;