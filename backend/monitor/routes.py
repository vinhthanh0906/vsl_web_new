import sys
import time
import os
from typing import Dict
from types import SimpleNamespace
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func, text
from jose import jwt, JWTError

# ensure modules package is importable
sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")
from modules.database import SessionLocal
from modules.monitor_models import ActivityLog, LessonCompletion
from modules.create_table import User

# Simple in-memory presence store: user_id -> last_seen_timestamp
online_users: Dict[int, float] = {}
user_status_overrides: Dict[int, str] = {}

# JWT settings (keep in sync with auth/utils.py)
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
# Optional static admin token for client-only admin flows (dev only)
ADMIN_STATIC_TOKEN = os.getenv("ADMIN_STATIC_TOKEN", "")
# Optional comma-separated list of admin usernames or emails (e.g. ADMIN_USERS=admin@x.com,superuser)
ADMIN_USERS = set([s.strip() for s in os.getenv("ADMIN_USERS", "").split(",") if s.strip()])
auth_scheme = HTTPBearer()


router = APIRouter(prefix="", tags=["monitor"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    token = credentials.credentials if credentials else None

    if ADMIN_STATIC_TOKEN and token == ADMIN_STATIC_TOKEN:
        admin = SimpleNamespace()
        admin.is_admin = 1
        admin.username = "static-admin"
        return admin

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")
    
    # Check ADMIN_USERS env var
    if username in ADMIN_USERS:
        admin = SimpleNamespace()
        admin.is_admin = 1
        admin.username = username
        return admin

    # Check admins table
    try:
        row = db.execute(
            text("SELECT id, username, email FROM users WHERE username = :u OR email = :u LIMIT 1"),
            {"u": username}
        ).mappings().first()

        if row:
            admin = SimpleNamespace()
            admin.is_admin = 1
            admin.username = row.get("username") or row.get("email") or username
            admin.id = row.get("id")
            return admin
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admins query failed: {str(e)}")

    user = db.query(User).filter(User.username == username).first()
    if user and getattr(user, "is_admin", False):
        admin = SimpleNamespace()
        admin.is_admin = 1
        admin.username = username
        return admin

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")



@router.get("/admin/users")
def admin_list_users(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Return list of non-admin users (including hashed password)."""
    try:
        users = (
            db.query(User)
            .filter(User.is_admin.isnot(True))  #
            .all()
        )

        return [
            {
                "id": u.id,
                "name": getattr(u, "username", None) or getattr(u, "name", ""),
                "email": getattr(u, "email", ""),
                "hashed_password": u.hashed_password,  # ✅ explicitly include
            }
            for u in users
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching users: {str(e)}"
        )



