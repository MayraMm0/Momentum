import fastapi
from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Optional
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
from datetime import datetime
from openai import OpenAI
import random
from app.quotes.gender_degree import gender_degree_quotes  #Imports gender/degree quotes
from app.quotes.daily_classes import daily_class_quotes #Imports classes quotes
from app.user_data import get_user_by_username
from app.security import JWT_SECRET, JWT_ALGORITHM
from jose import JWTError, jwt

async def get_user_info(authorization: Optional[str] = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]  # Get the token string after "Bearer "

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")

        stored_user = get_user_by_username(username)
        if stored_user is None:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "degree": stored_user.degree,
            "gender": stored_user.gender,
            "date": datetime.now().date(),
            "day_of_week": datetime.now().strftime("%A"),
            "has_exam": False,
            "hardest_class_today": "Thermodynamics",
            # Add any other needed info here
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY =", api_key)
aclient = AsyncOpenAI(api_key=api_key)

router = APIRouter()


#PROMPT GENERATORS
def generate_prompt_degree_gender(user): #Degree/Gender prompt
    return (
        f"Generate less than 20 words motivational quote for a {user['gender']} student "
        f"majoring in {user['degree']} The quote should be original, inspiring, "
        f"and informal, get creative and add a little bit of fun while still being highly motivational!"
    )

def generate_prompt_test(user): #Test prompt
    return (
        f"Generate a short motivational quote for a {user['gender']} student that has an important test today. "
        f"Do it fun and creative! "
    )
def generate_prompt_daily_classes(user):
    return (
        f"Generate a short motivational quote for a {user['gender']} student that has {user[hardest_class_today]}"
        f"as their most difficult class today. Be creative and inspiring, but not cringe"
    )

# STATIC FILTERS
def get_static_degree_quote(user):
    matches = [
        q for q in gender_degree_quotes
        if (q["gender"] == user["gender"] or q["gender"] == "neutral") and
           (q["degree"] == user["degree"] or q["degree"] == "neutral")
    ]
    return random.choice(matches)["text"] if matches else "Keep going — your effort matters!"

def get_static_class_quote(user):
    matches = [
        q for q in daily_class_quotes
        if q["class"].lower() == user["hardest_class_today"].lower() and
           (q["gender"] == user["gender"] or q["gender"] == "neutral") and
           (q["degree"] == user["degree"] or q["degree"] == "neutral")
    ]
    return random.choice(matches)["text"] if matches else f"Stay strong through {user['hardest_class_today']}!"

#QUOTE GENERATOR
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
    #Weekends
    if user["day_of_week"] in ["Saturday", "Sunday"]: #Checks if the day is a weekend day
        weekend_prompt = "Generate a motivational quote for a student on the weekend. Make it informal and optionally funny, encouraging rest or catching up on homework."
        return {"quote": await generate_ai_quote(weekend_prompt)}

    #Weekdays
    if user["has_exam"]: #Check's if the user has an exam today
        return {"quote": await generate_ai_quote(generate_exam_prompt(user))} #Creates a quote for the exam


    if random.random() < 0.5: #50% chance of choosing a degree/gender quote

        if random.random() < 0.7: #70% chance of it being an AI quote
            quote = await generate_ai_quote(generate_prompt_degree_gender(user))
        else: #30% chance of choosing a quote from our list
            quote = get_static_degree_quote(user)
    else: #50% chance of being related to his classes

        class_chance = random.random()
        if class_chance < 0.5: #50% chance of choosing an AI quote
            quote = await generate_ai_quote(generate_prompt_daily_classes(user))
        elif class_chance < 0.65: #15% chance of being just a simple comment
            quote = "Good luck in today’s classes!"
        elif class_chance < 0.80: #15% chance of being another comment targeting hardest class
            quote = f"Good luck with {user['hardest_class_today']} today!"
        else: #20% chance being one of our choices
            quote = get_static_class_quote(user)

    return {"quote": quote}