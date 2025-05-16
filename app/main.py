from fastapi import FastAPI #Imports  fastAPI to start the code
from pydantic import BaseModel

app = FastAPI() #Creates the controller, the core of the application

@app.get("/") #This is the route for the homepage, traducing the code to FastAPI
#When someone goes to the homepage (/), show them this message
def read_root(): 
    return {"message": "Welcome to Momentum!"}  #This is what gets shown on the homepage

@app.get("/user") #routhe for user page
def user():
    return 0

class User:
    def __init__(self, user_name):
        self.user_name = user_name


class user(BaseModel):
    username: str
    password: str
    degree: str = "general"
    gender: str = "neutral"
    classes_today: list[str] = []