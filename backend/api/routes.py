# backend/api/routes.py (最终解锁逻辑版)

from fastapi import APIRouter, HTTPException
from langchain_core.prompts import ChatPromptTemplate
from core.models import ( # 确保导入了所有需要的模型
    ChatRequest, ChatResponse, CardData, ProfileData, ProfileUpdateRequest
)
from core.models import ChatMessage
from core import state_manager
from agents import planner_agent
from agents.prompts import TUTOR_PROMPT_TEMPLATE
import time
from typing import List

router = APIRouter()
DEMO_SESSION_ID = "user123"

@router.get("/cards", response_model=List[CardData])
async def get_cards():
    return state_manager.get_all_cards()

@router.post("/cards/{card_id}/favorite", response_model=CardData)
async def toggle_card_favorite(card_id: str):
    updated_card = state_manager.toggle_favorite(card_id)
    if not updated_card:
        raise HTTPException(status_code=404, detail="Card not found")
    return updated_card

@router.get("/profile", response_model=ProfileData)
async def get_user_profile():
    return state_manager.get_profile()

@router.put("/profile", response_model=ProfileData)
async def update_user_profile(profile_update: ProfileUpdateRequest):
    return state_manager.update_profile(profile_update)

@router.post("/reset")
async def reset_session():
    if DEMO_SESSION_ID in state_manager.SESSIONS:
        state_manager.SESSIONS.pop(DEMO_SESSION_ID)
    return {"message": "Session has been reset."}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    session = state_manager.get_session(DEMO_SESSION_ID)

    # 1. 生成学习路径
    if not session["path_generated"]:
        if not request.text:
            raise HTTPException(status_code=400, detail="User input is needed.")
        
        learning_plan = await planner_agent.generate_learning_plan(request.text)
        state_manager.update_learning_path(DEMO_SESSION_ID, learning_plan.path)
        
        return ChatResponse(
            text=learning_plan.starting_recommendation,
            learningPath=learning_plan.path
        )

    # 2. 点击学习路径项
    if request.topicId is not None:
        current_topic_id = session.get('current_topic_id')
        if current_topic_id:
             # 将上一个正在进行的任务标记为已完成
            state_manager.update_topic_status(DEMO_SESSION_ID, current_topic_id, 'completed')

        state_manager.set_current_topic(DEMO_SESSION_ID, request.topicId)
        state_manager.update_topic_status(DEMO_SESSION_ID, request.topicId, 'in-progress')
        
        topic_title = session['learning_path'][request.topicId-1]['title']
        chat_history = state_manager.get_chat_history(DEMO_SESSION_ID, request.topicId)

        response_text = f"很好，我们正式开始 **{topic_title}** 的学习。\n你可以随时向我提问，或者让我开始为你讲解。"
        
        if not chat_history:
            ai_message = ChatMessage(id=time.time() * 1000, text=response_text, sender='ai')
            state_manager.add_to_chat_history(DEMO_SESSION_ID, request.topicId, ai_message)
            chat_history = [ai_message.dict()]

        return ChatResponse(
            text=response_text,
            learningPath=session['learning_path'],
            updatePath=True,
            chatHistory=chat_history
        )

    # 3. 处理普通消息
    if request.text:
        current_topic_id = session.get('current_topic_id')
        if not current_topic_id:
            return ChatResponse(text="请先从左侧选择一个学习主题开始。", chatHistory=[])

        user_message = ChatMessage(id=time.time() * 1000, text=request.text, sender='user')
        state_manager.add_to_chat_history(DEMO_SESSION_ID, current_topic_id, user_message)
        
        topic_title = session['learning_path'][current_topic_id-1]['title']
        
        # --- 这是最核心的修改 ---
        # 检查用户是否想进入下一个主题
        user_intent_to_advance = any(keyword in request.text for keyword in ["下一个", "下一步", "学完了", "学习了", "完成", "继续"])

        if user_intent_to_advance:
            # 执行解锁逻辑
            state_manager.update_topic_status(DEMO_SESSION_ID, current_topic_id, 'completed')
            next_topic_id = current_topic_id + 1
            
            response_text = ""
            if next_topic_id <= len(session['learning_path']):
                state_manager.update_topic_status(DEMO_SESSION_ID, next_topic_id, 'unlocked')
                next_topic_title = session['learning_path'][next_topic_id-1]['title']
                response_text = f"太棒了！我们已经完成了 **{topic_title}** 的学习。\n\n下一个主题 **{next_topic_title}** 已经为你解锁。请从左侧点击它开始新的学习吧！"
            else:
                response_text = f"恭喜你！你已经完成了所有学习计划！你太棒了！"

            ai_message = ChatMessage(id=time.time() * 1000, text=response_text, sender='ai')
            state_manager.add_to_chat_history(DEMO_SESSION_ID, current_topic_id, ai_message)
            
            return ChatResponse(
                text=response_text,
                learningPath=session['learning_path'],
                updatePath=True
            )
        
        else:
            # 如果不是要进入下一步，就执行正常的辅导对话逻辑
            try:
                llm = planner_agent.get_deepseek_llm()
                prompt = ChatPromptTemplate.from_template(TUTOR_PROMPT_TEMPLATE)
                chain = prompt | llm
                
                payload = {"topic_title": topic_title, "user_input": request.text}
                
                ai_response = await chain.ainvoke(payload)
                
                ai_message = ChatMessage(id=time.time() * 1000, text=ai_response.content, sender='ai')
                state_manager.add_to_chat_history(DEMO_SESSION_ID, current_topic_id, ai_message)

                updated_history = state_manager.get_chat_history(DEMO_SESSION_ID, current_topic_id)
            
                return ChatResponse(text=ai_response.content, chatHistory=updated_history)

            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    raise HTTPException(status_code=400, detail="Invalid request.")