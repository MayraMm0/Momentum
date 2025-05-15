from fastapi import FastAPI #Imports  fastAPI to start the code

app = FastAPI() #Creates the controller, the core of the application

@app.get("/") #This is the route for the homepage
#When someone goes to the homepage (/), show them this message
def read_root(): 
    return {"message": "Welcome to Momentum!"}  #This is what gets shown on the homepage
#aaeae
