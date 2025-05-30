import fastapi
import re
import os
import random
from fastapi import APIRouter, Depends
from openai import OpenAI, AsyncOpenAI
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime
from openai import OpenAI
from app.quotes.gender_degree import gender_degree_quotes  #Imports gender/degree quotes
from app.quotes.daily_classes import daily_class_quotes #Imports classes quotes
from app.user_data import get_user_by_username
from difflib import SequenceMatcher
from app.authentication import get_user_info

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
aclient = AsyncOpenAI(api_key=api_key)

recent_quotes = [] # In-memory list of recent quotes to avoid repeats (can be replaced by DB/cache later)
recent_cliches = [] #List of cliche phrases
recent_class_patterns = [] #In-memory list of recent class quotes

#We don't want this phrases, maybe once or twice, that's it
cliche_phrases = [
    "reach for the stars",
    "the sky's the limit",
    "never give up",
    "dream big",
    "believe in yourself",
    "shoot for the stars"
]

MAX_RECENT_QUOTES = 30  # limit memory size
MAX_RECENT_CLICHES = 2
MAX_RECENT_CLASS_PATTERNS = 2

router = APIRouter()


#PUNCTUATION REPETITION CHECK
def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)  # remove punctuation
    text = re.sub(r'\s+', ' ', text)     # collapse spaces
    return text.strip()
#SIMILARITY CHECK
def is_similar(a: str, b: str, threshold: float = 0.85) -> bool:
    a_norm = normalize_text(a)
    b_norm = normalize_text(b)
    return SequenceMatcher(None, a_norm, b_norm).ratio() > threshold
#CLICHE CHECK
def contains_recent_cliche(quote: str) -> bool:
    for phrase in cliche_phrases:
        if phrase in quote.lower():
            if phrase in recent_cliches:
                return True
            # New use — track it
            recent_cliches.append(phrase)
            if len(recent_cliches) > MAX_RECENT_CLICHES:
                recent_cliches.pop(0)
    return False

#CLASS REPETITION CHECK
def normalize_class_phrase(quote: str, class_name: str) -> str:
    lower_quote = quote.lower()
    class_name_lower = class_name.lower()

    # Replace variations of class name with placeholder
    normalized = lower_quote.replace(class_name_lower, "{class}")

    # Reduce to common pattern
    normalized = normalized.replace("embrace the challenge of {class}", "challenge_{class}")
    normalized = normalized.replace("face the challenge of {class}", "challenge_{class}")
    normalized = normalized.replace("tackle the challenge of {class}", "challenge_{class}")
    normalized = normalized.replace("survive {class}", "challenge_{class}")

    return normalized

#UNIQUE QUOTE CHECK
def is_unique_quote(new_quote: str, class_name: Optional[str] = None) -> bool:
    if contains_recent_cliche(new_quote):
        return False

    # Normalize and filter by recent class phrases
    if class_name:
        normalized = normalize_class_phrase(new_quote, class_name)
        if normalized in recent_class_patterns:
            return False
        recent_class_patterns.append(normalized)
        if len(recent_class_patterns) > MAX_RECENT_CLASS_PATTERNS:
            recent_class_patterns.pop(0)

    return all(not is_similar(new_quote, prev_quote) for prev_quote in recent_quotes)


#PROMPT GENERATORS
def generate_prompt_degree_gender(user): #Degree/Gender prompt
    return (
        f"Generate less than 20 words motivational quote for a {user['gender']} student "
        f"majoring in {user['degree']} The quote should be original, inspiring,"
        f"and informal. Make them UNIQUE"
    )

def generate_prompt_test(user): #Test prompt
    return (
        f"Generate a less than 20 words quote for a {user['gender']} student that has an important test today."
        f"Do it fun, UNIQUE, and creative"
    )
def generate_prompt_daily_classes(user):
    return (
        f"Generate a less than 20 words quote for a {user['gender']} student that has {user['hardest_class_today']}"
        f"as their most difficult class today.Be creative, UNIQUE, and inspiring"
    )

# STATIC FILTERS
def get_static_degree_quote(user):
    matches = [
        q for q in gender_degree_quotes
        if (q["gender"] == user["gender"] or q["gender"] == "neutral") and
           (q["degree"] == user["degree"] or q["degree"] == "neutral")
    ]
    random.shuffle(matches)  # randomize order

    for quote in matches:
        if is_unique_quote(quote["text"]):
            recent_quotes.append(quote["text"])
            if len(recent_quotes) > MAX_RECENT_QUOTES:
                recent_quotes.pop(0)
            return quote["text"]

    return "Keep going — your effort matters!"

def get_static_class_quote(user):
    matches = [
        q for q in daily_class_quotes
        if q["class"].lower() == user["hardest_class_today"].lower() and
           (q["gender"] == user["gender"] or q["gender"] == "neutral") and
           (q["degree"] == user["degree"] or q["degree"] == "neutral")
    ]
    random.shuffle(matches)
    for quote in matches:
        if is_unique_quote(quote["text"]):
            recent_quotes.append(quote["text"])
            if len(recent_quotes) > MAX_RECENT_QUOTES:
                recent_quotes.pop(0)
            return quote["text"]

    return f"Stay strong through {user['hardest_class_today']} today!" #Fallback

#QUOTE GENERATOR
async def generate_ai_quote(prompt):
    for _ in range(4):
        response = await aclient.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,
            temperature=0.9
        )
        quote = response.choices[0].message.content.strip()
        if is_unique_quote(quote):
            recent_quotes.append(quote)
            if len(recent_quotes) > MAX_RECENT_QUOTES:
                recent_quotes.pop(0)
            return quote

    return response.choices[0].message.content.strip()  # Fallback: return last quote even if repeated

@router.get("/motivation/ai")
async def get_ai_motivation(user: dict = Depends(get_user_info)):
    #Weekends
    if user["day_of_week"] in ["Saturday", "Sunday"]: #Checks if the day is a weekend day
        weekend_prompt = "Generate a motivational quote for a student on the weekend. Make it informal and optionally funny, encouraging rest or catching up on homework"
        return {"quote": await generate_ai_quote(weekend_prompt)}

    #Weekdays
    if user["has_exam"]: #Check's if the user has an exam today
        return {"quote": await generate_ai_quote(generate_exam_prompt(user))} #Creates a quote for the exam

    if random.random() < 0.5: #50% chance of choosing a degree/gender quote

        if random.random() < 0.5: #50% chance of it being an AI quote
            quote = await generate_ai_quote(generate_prompt_degree_gender(user))
        else: #50% chance of choosing a quote from our list
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