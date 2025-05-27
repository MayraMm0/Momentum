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
        "degree": stored_user.degree,
        "gender": stored_user.gender,
        "classes_today": ["Thermodynamics", "CAD Design"],
        "date": datetime.now().date()
    }
def generate_prompt_degree_gender(user): #Degree/Gender prompt
    return (
        f"Generate a short motivational quote for a {user['gender']} student "
        f"majoring in {user['degree']} The quote should be original, inspiring, "
        f"and informal, get creative and add a little bit of fun while still being highly motivational!"
    )
def generate_prompt_classes(user): #Classes prompt
    return (
        f"Generate a short motivational quote for a {user['gender']} student that has this classes today: "
        f"{user['classes_today']} The quote should be original, inspiring, and informal, get creative and add a little bit of fun"
        f"while still being highly motivational! Also choose the hardest class and put emphasis on it"
    )
def generate_prompt_test(user): #Test prompt
    return (
        f"Generate a short motivational quote for a {user['gender']} student that has an important test today. "
        f"Do it fun and creative! "
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
