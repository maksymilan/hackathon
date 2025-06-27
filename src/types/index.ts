export interface LearningPathItem {
  id: number;
  title: string;
  status: 'locked' | 'unlocked' | 'in-progress' | 'completed';
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'ai' | 'user';
}

export type ChatHistories = Record<number, ChatMessage[]>;

export interface APIRequest {
  type: 'message' | 'path_click';
  text?: string;
  topicId?: number;
}

export interface APIResponse {
  text: string;
  learningPath?: LearningPathItem[];
  updatePath?: boolean;
  chatHistory?: ChatMessage[];
}

export interface CardData {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  imageUrl?: string;
}

export interface ProfileData {
  nickname: string;
  avatar: string;
  interests: string[];
}