import jwt
from fastapi import Header, HTTPException
from typing import Optional
from datetime import datetime
from jwt.exceptions import InvalidTokenError
from src.backend.user_data import get_user_by_username
from src.backend.security import JWT_SECRET, JWT_ALGORITHM

#USER TOKEN DECODING
async def get_user_info(authorization: Optional[str] = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]  # Get the token string after "Bearer"

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")

        stored_user = get_user_by_username(username)
        if stored_user is None:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "username": stored_user.username,
            "degree": stored_user.degree,
            "gender": stored_user.gender,
            "date": datetime.now().date(),
            "day_of_week": datetime.now().strftime("%A"),
            "has_exam": False,
            "hardest_class_today": "Thermodynamics",

        }
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")