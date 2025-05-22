import fastapi
from fastapi import APIRouter, Depends
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
from datetime import datetime
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY =", api_key)
aclient = AsyncOpenAI(api_key=api_key)

router = APIRouter()

def get_user_info():
    return {
        "degree": "aerospace",
        "gender": "neutral",
        "classes_today": ["Thermodynamics", "CAD Design"],
        "date": datetime.now().date()
    }
def generate_prompt(user):
    return (
        f"Generate a short motivational quote for a {user['gender']} student "
        f"majoring in {user['degree']} who has the following classes today: "
        f"{', '.join(user['classes_today'])}. The quote should be original, inspiring, and informal, get creative!"
    )
async def generate_ai_quote(prompt):
    response = await aclient.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=60,
        temperature=0.9
    )
    return response.choices[0].message.content.strip()

@router.get("/motivation/ai")
async def get_ai_motivation(user: dict = Depends(get_user_info)):
    prompt = generate_prompt(user)
    quote = await generate_ai_quote(prompt)
    return {"quote": quote}
