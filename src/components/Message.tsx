// src/components/Message.tsx (最终修复版 - 解决ref不兼容问题)

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
  assistantName?: string;
}

const Message: React.FC<MessageProps> = ({ message, assistantName = 'AI助手' }) => {
  const messageClass = message.sender === 'ai' ? 'ai-message' : 'user-message';

  return (
    <div className={`message ${messageClass}`}>
      {message.sender === 'ai' && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>🤖</span>
          <span style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: 15 }}>{assistantName}</span>
        </div>
      )}
      <ReactMarkdown
        children={message.text}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            
            return match ? (
              // 对于代码块，我们使用SyntaxHighlighter组件
              <SyntaxHighlighter
                style={atomDark as any}
                language={match[1]}
                PreTag="div"
                // --- 这是最关键的修改 ---
                // 我们不再传递 {...props}，因为其中的ref等属性与SyntaxHighlighter不兼容
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              // 对于行内代码，我们使用原生的code标签
              // 这里可以安全地传递props，因为code是原生HTML元素
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

export default Message;