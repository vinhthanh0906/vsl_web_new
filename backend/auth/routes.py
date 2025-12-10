import sys
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

sys.path.append(r"D:\WORK\Python\web\github_zone\vsl_web_new\backend\modules")
sys.path.append (r"D:\WORK\Python\web\github_zone\vsl_web_new\backend\monitor")

from modules.database import SessionLocal
from modules.create_table import User
from utils import create_access_token
from modules.schemas import UserCreate, UserLogin, UserResponse
from verify import hash_password, verify_password
from monitor.create_table import ActivityLog, LessonCompletion

from sqlalchemy import func, text
from datetime import datetime, timedelta



router = APIRouter(prefix="", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first() #auth
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first() #auth
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/admin/login")
def admin_login(payload: dict, db: Session = Depends(get_db)):
    """Authenticate an admin account stored in a separate `admins` table and return a JWT.
    Expected payload: { "username": "..." } or { "email": "..." }, and "password".
    """
    identifier = payload.get("username") or payload.get("email")
    password = payload.get("password")
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="username/email and password required")

    try:
        row = db.execute(text("SELECT * FROM admins WHERE username = :u OR email = :u LIMIT 1"), {"u": identifier}).fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin lookup failed: {e}")

    if not row:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    mapping = row._mapping if hasattr(row, "_mapping") else dict(row)
    hashed = mapping.get("hashed_password") or mapping.get("password")
    if not hashed or not verify_password(password, hashed):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    sub = mapping.get("username") or mapping.get("email") or identifier
    token = create_access_token({"sub": sub})
    return {"access_token": token, "token_type": "bearer"}


# Lesson logging
@router.post("/log")
def log_event(event: dict, db: Session = Depends(get_db)):
    # expected event: { "user_id": 1, "event_type": "view_lesson", "detail": "...", "lesson_id": 2 }
    new = ActivityLog(user_id=event.get("user_id"), event_type=event["event_type"], detail=event.get("detail"))
    db.add(new)
    if event.get("event_type") == "complete_lesson" and event.get("lesson_id"):
        comp = LessonCompletion(lesson_id=event["lesson_id"], user_id=event.get("user_id"), progress=100.0)
        db.add(comp)
    db.commit()
    return {"status":"ok"}


