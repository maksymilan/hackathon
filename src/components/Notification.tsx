import React, { useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'favorite' | 'unfavorite';
  message: string;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'favorite':
        return '⭐';
      case 'unfavorite':
        return '✖️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification ${type}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{getIcon()}</span>
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.2rem',
          opacity: 0.7
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification; 