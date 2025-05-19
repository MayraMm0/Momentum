from fastapi import FastAPI #Imports  fastAPI to start the code
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from app.user_data import User, user_database

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
    if user.username in user_database: #Check if user already in the data base
        return {"error": "Username already exists"}

    user_database[user.username] = user #Appends to the dictionary

    return {"message": f'User {user.username} created'} #Returns message of use created

@app.post("/login") #Route to log an existing user
def login(user: User):
    user = User.get_user_by_username(username) #Searchs for user by searching the username
    if not user or user.password != password:  #Authentication
        raise HTTPException(status_code=401, detail="Username or password is incorrect")

    return {"message": f"Welcome back, {user.username}"}