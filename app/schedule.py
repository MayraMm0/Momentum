from pydantic import BaseModel
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from app.authentication import get_user_info  # Your full JWT decoder



class ScheduleItem(BaseModel):
    id: Optional[str] = None
    title: str
    type: str
    date_start: datetime
    date_finish: datetime
    description: Optional[str] = None
    completed: bool = False
    course: Optional[str] = None

schedule_router = APIRouter(dependencies=[Depends(get_user_info)])

user_schedule: Dict[str, List[ScheduleItem]] = {}

# Add a new schedule item
@schedule_router.post("/schedule/add", response_model=ScheduleItem)
def add_schedule_item(item: ScheduleItem, user_info: dict = Depends(get_user_info)):
    username = user_info["username"]
    if not item.id:
        item.id = str(uuid4())
    user_schedule.setdefault(username, []).append(item)
    return item

# Get schedule items in a specific time frame for the user
@schedule_router.get("/schedule/view", response_model=List[ScheduleItem])
def view_calendar(
    user_info: dict = Depends(get_user_info), # Get user info via dependency
    start: Optional[datetime] = Query(None),  # Optional query parameter: filter start datetime
    end: Optional[datetime] = Query(None)     # Optional query parameter: filter end datetime
):
    username = user_info["username"]

    # Retrieve the user's list of scheduled events from the in-memory dictionary
    events = user_schedule.get(username, [])

    # If both start and end dates are provided, filter events within that range
    if start and end:
        events = [
            event for event in events
            if start <= event.date_start <= end # Keep only events whose start date is within the range
        ]

        # Return the final list of events (filtered and sorted)
    events.sort(key=lambda e: e.date_start)

    return events

# Get today's schedule
@schedule_router.get("/schedule/today", response_model=List[ScheduleItem])
def get_today_schedule(user_info: dict = Depends(get_user_info)):
    username = user_info["username"]
    today = datetime.now().date()
    return [
        item for item in user_schedule.get(username, [])
        if item.date_start.date() == today
    ]

# Mark an item as completed
@schedule_router.put("/schedule/complete/{item_id}")
def mark_completed(item_id: str, user_info: dict = Depends(get_user_info)):
    username = user_info["username"]
    for item in user_schedule.get(username, []):
        if item.id == item_id:
            item.completed = True
            return {"message": "Marked as completed"}
    raise HTTPException(status_code=404, detail="Item not found")

# Delete an item
@schedule_router.delete("/schedule/delete/{item_id}")
def delete_schedule_item(item_id: str, user_info: dict = Depends(get_user_info)):
    username = user_info["username"]
    items = user_schedule.get(username, [])
    updated_items = [item for item in items if item.id != item_id]
    if len(items) == len(updated_items):
        raise HTTPException(status_code=404, detail="Item not found")
    user_schedule[username] = updated_items
    return {"message": "Item deleted"}