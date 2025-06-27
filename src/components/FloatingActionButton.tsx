import React from 'react';

interface FloatingActionButtonProps {
  icon: string;
  onClick: () => void;
  label?: string;
  color?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label,
  color = 'primary'
}) => {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton; 