from pydantic import BaseModel
from typing import Optional

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


