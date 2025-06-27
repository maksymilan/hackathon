import React from 'react';
import type { LearningPathItem } from '../types';

interface Props {
  path: LearningPathItem[];
  onItemClick: (item: LearningPathItem) => void;
  currentTopicId: number | null;
}

const LearningPath: React.FC<Props> = ({ path, onItemClick, currentTopicId }) => {
  return (
    <aside className="sidebar">
      <h2>学习路径</h2>
      <ul id="learning-path-list">
        {path.map(item => {
          const status = item.id === currentTopicId ? 'in-progress' : item.status;
          return (
            <li
              key={item.id}
              className={`path-item ${status}`}
              onClick={() => status !== 'locked' && onItemClick(item)}
            >
              {item.id}. {item.title}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
export default LearningPath;