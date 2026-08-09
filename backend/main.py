from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.routers import users, courses, extracurriculars, meetings, today, projects, tasks, schedule, motivationR
from backend.dependencies import get_current_user
from backend.models import User

Base.metadata.create_all(bind = engine)

app = FastAPI(title = "Momentum API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # Because we send a custom Auth header
)

app.include_router(users.router)
app.include_router(courses.router)
app.include_router(extracurriculars.router)
app.include_router(meetings.router)
app.include_router(today.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(schedule.router)
app.include_router(motivationR.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Momentum!"}
