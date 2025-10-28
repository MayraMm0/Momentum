from pydantic import BaseModel
from typing import Optional, Dict, List

user_database = {}

class User(BaseModel): #BaseModel ayuda a manejar la información para la api
    username: str
    password: str
    degree: str = "general"
    gender: str = "neutral"
    classes_today: list[str] = []

    class Config:
        allow_mutation = True

def get_user_by_username (username: str):
    return user_database.get(username)

# In-memory storage: maps user IDs to their classes and difficulty ratings
# Structure: { user_id: { class_name: difficulty_int } }
user_class_difficulties: Dict[str, Dict[str, int]] = {}

# Define the expected structure of the request body
class RankedInput(BaseModel):
    user_id: str  # Identifier for the user submitting rankings
    ordered_classes: List[str]  # List of classes ordered from hardest to easiest
