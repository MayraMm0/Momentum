from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import jwt
from backend.auth import decode_access_token
from backend.database import get_db
from backend.models import User, Session as SessionModel
from backend.security import hash_token

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    
    # # 3. HTTPBearer automatically extracts the token and ensures it's a Bearer token.
    # credentials.credentials contains the raw token string directly.
    token = credentials.credentials

    try:
        username = decode_access_token(token)
    # 1st check: is the JWT itself valid?
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    session_row = db.query(SessionModel).filter(
        SessionModel.token_hash == hash_token(token)
    ).first()

    #2nd check: does a session_row for this token exist and is not revoked
    if session_row is None or session_row.is_revoked:
        raise HTTPException(status_code=401, detail="Session is invalid or has been revoked")

    #3rd check: has the session's expiry passed
    if session_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session has expired")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user