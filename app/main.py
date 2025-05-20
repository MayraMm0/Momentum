from fastapi import FastAPI #Imports  fastAPI to start the code
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from app.user_data import User, user_database
from security import hash_password, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_MINUTES #verify_password
import jwt #For token
from datetime import datetime, timedelta

class LoginRequest(BaseModel):
    username: str
    password: str

app = FastAPI() #Creates the controller, the core of the application

@app.get("/") #This is the route for the homepage, traducing the code to FastAPI
#When someone goes to the homepage (/), show them this message
def read_root(): 
    return {"message": "Welcome to Momentum!"}  #This is what gets shown on the homepage

@app.get("/user") #Route for user page
def user():
    return 0

@app.post("/register") #Path to register a new user
def register_user(user: User):
    if user.username in user_database: #Check if user already in data base
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = hash_password(user.password)
    user.password = hashed_pw  # Store hashed password
    user_database[user.username] = user #Appends to the dictionary

    return {"message": f'User {user.username} created'} #Returns message of use created

@app.post("/login") #Route to login an existing user
def login(user: User):
    user = User.get_user_by_username(username) #Searchs for user by searching the username
    if not user or user.password != password:  #Authentication
        raise HTTPException(status_code=401, detail="Username or password is incorrect")
    payload = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES),
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM) #JWT Token

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "degree": user.degree,
        "gender": user.gender,
        "classes_today": user.classes_today,
        "message": f"Welcome back, {user.username}"
    }