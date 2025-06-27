// src/pages/ChatSpace.tsx (已修复)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import LearningPath from '../components/LearningPath';
import type { ChatMessage, LearningPathItem, ChatHistories } from '../types';
import { callChatAPI } from '../services/api'; // 导入统一的聊天API

const ChatSpace: React.FC = () => {
    const { topic } = useParams<{ topic: string }>();
    
    const [learningPath, setLearningPath] = useState<LearningPathItem[]>([]);
    const [chatHistories, setChatHistories] = useState<ChatHistories>({});
    const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    const currentMessages = currentTopicId ? chatHistories[currentTopicId] || [] : chatHistories[0] || [];

    const initialize = () => {
        const greeting: ChatMessage = {
            id: Date.now(),
            sender: 'ai',
            text: `你好！欢迎来到${topic}学习空间！请告诉我你的学习目标，我会为你量身打造学习路径。`
        };
        setLearningPath([]);
        setCurrentTopicId(null);
        setChatHistories({ 0: [greeting] });
    };

    useEffect(initialize, [topic]);

    const handleUserSubmit = async (text: string) => {
        const topicIdToSubmit = currentTopicId || 0;
        const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };
        
        setChatHistories(prev => ({
            ...prev,
            [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newUserMessage]
        }));
        setIsThinking(true);
        
        // 使用统一的聊天API
        const response = await callChatAPI({ type: 'message', text });
        
        setIsThinking(false);

        const newAiMessage: ChatMessage = {id: Date.now(), text: response.text, sender: 'ai'};

        if (response.learningPath) {
            setLearningPath(response.learningPath);
        }
        
        // 使用后端返回的完整历史记录来更新，保证状态一致
        if (response.chatHistory) {
            setChatHistories(prev => ({...prev, [topicIdToSubmit]: response.chatHistory!}));
        } else {
             // 如果后端没有返回完整历史，只追加最新一条AI消息
            setChatHistories(prev => ({
                ...prev,
                [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newAiMessage]
            }));
        }
    };
  
    const handlePathItemClick = async (item: LearningPathItem) => {
        if (item.id === currentTopicId) return;

        setIsThinking(true);
        // 使用统一的聊天API
        const response = await callChatAPI({ type: 'path_click', topicId: item.id });
        setIsThinking(false);

        setCurrentTopicId(item.id);

        if (response.learningPath) setLearningPath(response.learningPath);
        if (response.chatHistory) {
            setChatHistories(prev => ({...prev, [item.id]: response.chatHistory!}));
        }
    };

    const handleReset = async () => {
        await fetch('http://localhost:8000/api/reset', { method: 'POST' });
        initialize();
    }

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
