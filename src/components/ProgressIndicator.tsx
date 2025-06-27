import React from 'react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  label = '进度',
  showPercentage = true
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        {showPercentage && (
          <span className="progress-percentage">{percentage}%</span>
        )}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-stats">
        <span>{current} / {total}</span>
      </div>
    </div>
  );
};

export default ProgressIndicator; 