# backend/core/models.py (用以下内容覆盖整个文件)

from pydantic import BaseModel
from typing import List, Optional

# --- API Request Models ---
class ChatRequest(BaseModel):
    text: Optional[str] = None
    topicId: Optional[int] = None

class ProfileUpdateRequest(BaseModel):
    nickname: str
    avatar: str
    interests: List[str]

# --- Data Structure Models ---
class CardData(BaseModel):
    id: str  # e.g., "python", "webscraping"
    title: str
    description: str
    isFavorite: bool = False

class ProfileData(BaseModel):
    nickname: str = "学习者"
    avatar: str = "default_avatar.png" # 默认头像
    interests: List[str] = []

class ChatMessage(BaseModel):
    id: float
    text: str
    sender: str

class LearningPathItem(BaseModel):
    id: int
    title: str
    status: str

class LearningPlan(BaseModel):
    path: List[LearningPathItem]
    estimated_time: str
    starting_recommendation: str

# --- API Response Models ---
class ChatResponse(BaseModel):
    text: str
    learningPath: Optional[List[LearningPathItem]] = None
    updatePath: Optional[bool] = False
    chatHistory: Optional[List[ChatMessage]] = None