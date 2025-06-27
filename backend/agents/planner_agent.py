import os
import httpx
from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from core.models import LearningPlan
from .prompts import PLANNER_PROMPT_TEMPLATE

def get_deepseek_llm():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_API_BASE")
    if not api_key or not base_url:
        raise HTTPException(status_code=500, detail=".env file not configured correctly.")
    
    client = httpx.Client()
    
    return ChatOpenAI(
        model="deepseek-chat",
        api_key=api_key,
        base_url=base_url,
        temperature=0.7,
        http_client=client
    )

async def generate_learning_plan(user_input: str) -> LearningPlan:
    try:
        parser = JsonOutputParser(pydantic_object=LearningPlan)
        prompt = ChatPromptTemplate.from_template(
            template=PLANNER_PROMPT_TEMPLATE,
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        llm = get_deepseek_llm()
        chain = prompt | llm | parser

        learning_plan_dict = await chain.ainvoke({"user_input": user_input})
        learning_plan = LearningPlan(**learning_plan_dict)

        if learning_plan and learning_plan.path:
            for item in learning_plan.path:
                item.status = 'locked'
            if learning_plan.path:
                learning_plan.path[0].status = 'unlocked'
        return learning_plan
    except Exception as e:
        print(f"Error in generating learning plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate learning plan from AI: {e}")