import sys
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")
sys.path.append (r"/Users/hungcucu/Documents/vsl_web_new/backend/monitor")

from modules.database import SessionLocal
from modules.create_table import User
from auth.utils import create_access_token
from modules.schemas import UserCreate, UserLogin, UserResponse
from auth.verify import hash_password, verify_password
from monitor.create_table import ActivityLog, LessonCompletion

from sqlalchemy import func, text
from datetime import datetime, timedelta



router = APIRouter(prefix="", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.username == user.username).first() #auth
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_pw = hash_password(user.password)
        new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        # Find user by email
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password - try hash verification first, fall back to plain text comparison
        stored_password = db_user.hashed_password
        password_valid = False
        
        try:
            # Try to verify as hash first
            password_valid = verify_password(user.password, stored_password)
        except Exception:
            # If hash verification fails (e.g., password is stored as plain text), do plain text comparison
            password_valid = (user.password == stored_password)
        
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"sub": db_user.email, "user_id": db_user.id})
        
        # Return user data along with token
        return {
            "access_token": token, 
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "username": db_user.username,
                "email": db_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/admin/login")
def admin_login(payload: dict, db: Session = Depends(get_db)):
    """Authenticate an admin account. Checks users table for is_admin=True.
    Expected payload: { "username": "..." } and "password".
    Supports both hashed and plain text passwords.
    """
    username = payload.get("username")
    password = payload.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password required")

    try:
        # Check users table for admin user
        db_user = db.query(User).filter(User.username == username).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
        # Verify password - try hash verification first, fall back to plain text comparison
        stored_password = db_user.hashed_password
        password_valid = False
        
        try:
            # Try to verify as hash first
            password_valid = verify_password(password, stored_password)
        except Exception:
            # If hash verification fails (e.g., password is stored as plain text), do plain text comparison
            password_valid = (password == stored_password)
        
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
        # Check if user is admin
        if not getattr(db_user, 'is_admin', False):
            raise HTTPException(status_code=403, detail="User does not have admin privileges")

        token = create_access_token({"sub": db_user.username})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Rollback on any other database errors
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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



@router.get("/debug-db")
def debug_db(db: Session = Depends(get_db)):
    dbname = db.execute(text("SELECT current_database()")).scalar()
    user = db.execute(text("SELECT current_user")).scalar()
    schema = db.execute(text("SELECT current_schema()")).scalar()
    return {"current_database": dbname, "current_user": user, "current_schema": schema}        