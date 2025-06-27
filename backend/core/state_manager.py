# backend/core/state_manager.py (已修复)

from typing import Dict, Any, List
from .models import LearningPathItem, ChatMessage, CardData, ProfileData, ProfileUpdateRequest

# 模拟一个全局数据库
DB = {
    "cards": [
        CardData(id="python", title="Python 入门", description="从零开始，学习世界上最流行的编程语言。", isFavorite=True),
        CardData(id="webscraping", title="网络爬虫", description="学习如何从网站上自动抓取信息与数据。"),
        CardData(id="sql", title="SQL 从零到一", description="掌握数据查询与管理的必备技能。"),
        CardData(id="gamedev", title="Pygame 游戏开发", description="用Python制作属于你自己的2D小游戏。"),
        CardData(id="datascience", title="数据科学入门", description="学习用Pandas和NumPy处理和分析数据。"),
        CardData(id="fastapi", title="FastAPI Web开发", description="学习用现代化的Python框架构建高性能API。"),
        CardData(id="automation", title="办公自动化", description="用Python脚本自动处理Excel、邮件和文件。"),
        CardData(id="ai-basics", title="AI大模型入门", description="了解GPT等大语言模型的基本原理与应用。"),
    ],
    "profile": ProfileData(nickname="探索者007", interests=["Python 入门"]),
    "sessions": {}
}

# --- 卡片与个人资料管理 ---
def get_all_cards() -> List[CardData]:
    return DB["cards"]

def get_profile() -> ProfileData:
    return DB["profile"]

def toggle_favorite(card_id: str) -> CardData:
    for card in DB["cards"]:
        if card.id == card_id:
            card.isFavorite = not card.isFavorite
            return card
    return None

def update_profile(profile_data: ProfileUpdateRequest) -> ProfileData:
    DB["profile"].nickname = profile_data.nickname
    DB["profile"].avatar = profile_data.avatar
    DB["profile"].interests = profile_data.interests
    return DB["profile"]


# --- 会话管理 ---
#  关键修复：让 SESSIONS 指向 DB 中的同一个字典
SESSIONS: Dict[str, Dict[str, Any]] = DB["sessions"] 

def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "path_generated": False, "learning_path": [],
            "current_topic_id": None, "chat_histories": {}
        }
    return SESSIONS[session_id]

def update_learning_path(session_id: str, path: List[LearningPathItem]):
    session = get_session(session_id)
    session["path_generated"] = True
    session["learning_path"] = [item.dict() for item in path]
    for item in path:
        if item.id not in session["chat_histories"]:
            session["chat_histories"][item.id] = []

def get_chat_history(session_id: str, topic_id: int) -> List[Dict]:
    session = get_session(session_id)
    return session["chat_histories"].get(topic_id, [])

def add_to_chat_history(session_id: str, topic_id: int, message: ChatMessage):
    session = get_session(session_id)
    if topic_id not in session["chat_histories"]:
        session["chat_histories"][topic_id] = []
    session["chat_histories"][topic_id].append(message.dict())

def update_topic_status(session_id: str, topic_id: int, status: str):
    session = get_session(session_id)
    for item in session["learning_path"]:
        if item['id'] == topic_id:
            item['status'] = status
            break

def set_current_topic(session_id: str, topic_id: int):
    session = get_session(session_id)
    session["current_topic_id"] = topic_id
