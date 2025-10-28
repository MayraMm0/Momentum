import fastapi
import re
import os
import random
from fastapi import APIRouter, Depends
from openai import OpenAI, AsyncOpenAI
from typing import Optional, List, Union
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
# Initialize with mock key if not available (for testing)
if not api_key:
    api_key = "sk-mock-key-for-testing"
aclient = AsyncOpenAI(api_key=api_key)

recent_quotes: List[str] = [] # In-memory list of recent quotes to avoid repeats (can be replaced by DB/cache later)
recent_cliches = [] #List of cliche phrases
recent_class_patterns = [] #In-memory list of recent class quotes

#######BANNED PHRASES#######
cliche_phrases = [
    "reach for the stars",
    "the sky's the limit",
    "never give up",
    "dream big",
    "believe in yourself",
    "shoot for the stars"
]

cliche_class_phrases = [
    "Embrace the challenge of {class_name}"
]

MAX_RECENT_QUOTES = 30  # limit memory size
MAX_RECENT_CLICHES = 2
MAX_RECENT_CLASS_PATTERNS = 2

router = APIRouter()


#######NORMALIZING TEXT#######

def normalize_degree(degree: Union[str, list]) -> str: #Degree normalization
    if isinstance(degree, list):
        degree = degree[0] if degree else "neutral"
    degree = degree.lower().strip()
    if degree.endswith(" engineering"):
        degree = degree.rsplit(" engineering", 1)[0]
    return degree

def normalize_and_hash(quote: str) -> str: #Hashing to avoid repetition
    return normalize_text(quote).strip()

def normalize_text(text: str) -> str: #Puntuation normalization
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)  # remove punctuation
    text = re.sub(r'\s+', ' ', text)     # collapse spaces
    return text.strip()

#######SIMILARITIES CHECK#######
def is_similar(a: str, b: str, threshold: float = 0.85) -> bool:
    a_norm = normalize_text(a)
    b_norm = normalize_text(b)
    return SequenceMatcher(None, a_norm, b_norm).ratio() > threshold

#FUZZY PHRASE CHECK
def contains_fuzzy_phrase(text: str, phrase: str, threshold: float = 0.75) -> bool:
    text_norm = normalize_text(text)
    phrase_norm = normalize_text(phrase)
    len_phrase = len(phrase_norm)

    if len_phrase == 0 or len_phrase > len(text_norm):
        return False

    # Slide over text with windows matching phrase length
    for i in range(len(text_norm) - len_phrase + 1):
        window = text_norm[i:i+len_phrase]
        similarity = SequenceMatcher(None, window, phrase_norm).ratio()
        if similarity >= threshold:
            return True
    return False

#CLICHE CHECK
def contains_recent_cliche(quote: str) -> bool:
    for phrase in cliche_phrases:
        if contains_fuzzy_phrase(quote.lower(), phrase):
            if phrase in recent_cliches:
                return True
            recent_cliches.append(phrase)
            if len(recent_cliches) > MAX_RECENT_CLICHES:
                recent_cliches.pop(0)
    return False
#CLASS CLICHE CHECK
def contains_recent_cliche_class(quote: str, class_name: Optional[str] = None) -> bool:
    if not class_name:
        return False

    quote_norm = normalize_and_hash(quote)

    for phrase_template in cliche_class_phrases:
        phrase = phrase_template.format(class_name=class_name.lower())
        phrase_norm = normalize_and_hash(phrase)

        # Check if the generated quote contains this phrase (fuzzy match)
        if contains_fuzzy_phrase(quote_norm, phrase_norm): # If this phrase was recently used, consider it a repetition
            # Use the normalized version for tracking
            if phrase_norm in recent_class_patterns:
                return True
            # Otherwise, add it to the list of recent class-related phrases
            recent_class_patterns.append(phrase_norm)
            if len(recent_class_patterns) > MAX_RECENT_CLASS_PATTERNS: # Trim the list if it exceeds the allowed recent pattern memory
                recent_class_patterns.pop(0)
    return False # If none of the cliche patterns match or are recently repeated, the quote is considered fresh

#UNIQUE QUOTE CHECK
def is_unique_quote(quote: str) -> bool:
    norm = normalize_and_hash(quote)
    if norm in recent_quotes:
        return False
    recent_quotes.append(norm)
    if len(recent_quotes) > 20:
        recent_quotes.pop(0)
    return True

#UNIQUE QUOTE CLASS CHECK
def is_unique_class_quote(new_quote: str, class_name: Optional[str] = None) -> bool:
    if contains_recent_cliche_class(new_quote, class_name):
        return False
    return True

#######PROMPT GENERATORS#######
def generate_prompt_degree_gender(user): #Degree/Gender prompt
    return (
        f"Generate less than 20 words motivational quote for a {user['gender']} student "
        f"majoring in {user['degree']} The quote should be original, inspiring,"
    )

def generate_exam_prompt(user): #Test prompt
    return (
        f"Generate a less than 20 words quote for a {user['gender']} student that has an important test today."
    )
def generate_prompt_daily_classes(user):
    return (
        f"Generate a less than 20 words quote for a {user['gender']} student that has {user['hardest_class_today']}"
        f"as their most difficult class today."
    )

#######STATIC FILTERS#######
def get_static_degree_quote(user):
    user_degree_norm = normalize_degree(user["degree"])

    matches = []
    for q in gender_degree_quotes:
        quote_degrees = q["degree"]
        if isinstance(quote_degrees, str):
            quote_degrees = [quote_degrees]  # Normalize to list

        if (q["gender"] == user["gender"] or q["gender"] == "neutral") and (
            "neutral" in quote_degrees or user_degree_norm in quote_degrees
        ):
            matches.append(q)

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
        if is_unique_quote(quote["text"]) and is_unique_class_quote(quote["text"], class_name=user["hardest_class_today"]):
            recent_quotes.append(quote["text"])
            if len(recent_quotes) > MAX_RECENT_QUOTES:
                recent_quotes.pop(0)
            return quote["text"]

    return f"Stay strong through {user['hardest_class_today']} today!"  # fallback

#QUOTE GENERATOR
async def generate_ai_quote(prompt, class_name: Optional[str] = None):
    suffixes = [
        " Make it sound unique.",
        " Use a different tone than usual.",
        " Try a fresh perspective.",
        " Make it one-of-a-kind.",
        " Say it as if you were a friend encouraging someone.",
        " Use an analogy.",
        " Keep it casual.",
        " Talk like a personal trainer.",
        " Make him/her want to keep working hard."
    ]
    for _ in range(4):
        varied_prompt = prompt + random.choice(suffixes)
        response = await aclient.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": varied_prompt}],
            max_tokens=60,
            temperature=0.9
        )
        quote = response.choices[0].message.content.strip()
        if is_unique_quote(quote) and (class_name is None or is_unique_class_quote(quote, class_name)):
            recent_quotes.append(quote)
            if len(recent_quotes) > MAX_RECENT_QUOTES:
                recent_quotes.pop(0)
            return quote

    return response.choices[0].message.content.strip() # Fallback: return last quote even if repeated

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

    return {"quote": quote} #Returns the quote