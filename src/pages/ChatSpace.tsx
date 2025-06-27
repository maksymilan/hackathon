// src/pages/ChatSpace.tsx (最终修复版)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import LearningPath from '../components/LearningPath';
import type { ChatMessage, LearningPathItem, ChatHistories } from '../types';
import { callRealAPI } from '../services/api';

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

    useEffect(() => {
        // 当页面因topic变化而重新加载时，重置所有状态
        initialize();
    }, [topic]);

    const handleUserSubmit = async (text: string) => {
        if (!text.trim()) return;

        const topicIdToSubmit = currentTopicId || 0;
        const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };

        // 步骤 1: 立即将用户消息添加到UI，这是唯一一次添加用户消息
        setChatHistories(prev => ({
            ...prev,
            [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newUserMessage]
        }));
        setIsThinking(true);

        try {
            const response = await callRealAPI({ type: 'message', text });
            
            // 只有在API成功返回后才创建AI消息
            const newAiMessage: ChatMessage = { id: Date.now() + 1, text: response.text, sender: 'ai' };

            // 步骤 2: 只把AI的新消息追加到列表末尾
            setChatHistories(prev => ({
                ...prev,
                [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), newAiMessage]
            }));

            // 如果有新的学习路径，则更新它
            if (response.learningPath) {
                setLearningPath(response.learningPath);
            }

        } catch (error) {
            console.error("API call failed:", error);
            const errorAiMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "抱歉，我好像暂时连接不上服务器，请稍后再试。"
            };
            // 步骤 3: 即使出错，也只追加错误消息
            setChatHistories(prev => ({
                ...prev,
                [topicIdToSubmit]: [...(prev[topicIdToSubmit] || []), errorAiMessage]
            }));
        } finally {
            setIsThinking(false);
        }
    };
  
    const handlePathItemClick = async (item: LearningPathItem) => {
        if (item.id === currentTopicId) return;

        setIsThinking(true);
        const response = await callRealAPI({ type: 'path_click', topicId: item.id });
        setIsThinking(false);

        // 先设置当前的主题ID
        setCurrentTopicId(item.id);

        // 然后再更新其他状态
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
            {/* --- 这是关键的修改之处 --- */}
            {/* 我们将 currentTopicId 这个 state 传递给了 LearningPath 组件 */}
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
                    {/* <button onClick={handleReset} className="reset-button">新会话</button> */}
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