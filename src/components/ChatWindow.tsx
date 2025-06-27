// src/components/ChatWindow.tsx (修复拼写错误)

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSubmit: (text: string) => void;
  isThinking: boolean;
  assistantName?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSubmit, isThinking, assistantName }) => {
  const [input, setInput] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;
    onSubmit(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-window-outer">
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map(msg => <Message key={msg.id} message={msg} assistantName={assistantName} />)}
        {isThinking && <div className="ai-message thinking">AI 正在思考中</div>}
      </div>
      <div className="chat-form-container">
        <form className="chat-form-gemini" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            rows={1}
          />
          <button type="submit" disabled={!input.trim() || isThinking}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;