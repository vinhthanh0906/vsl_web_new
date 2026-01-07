from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import sys
import os
from datetime import datetime
from jose import jwt, JWTError

sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")

from modules.database import SessionLocal
from modules.create_table import Course, Lesson, User
from modules.schemas import CourseCreate, CourseResponse, LessonCreate, LessonResponse, LessonUpdate
from modules.timezone_utils import vietnam_now

# JWT settings (keep in sync with auth/utils.py)
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ADMIN_STATIC_TOKEN = os.getenv("ADMIN_STATIC_TOKEN", "")
ADMIN_USERS = set([s.strip() for s in os.getenv("ADMIN_USERS", "").split(",") if s.strip()])
auth_scheme = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/courses", tags=["courses"])

# Media upload directory
MEDIA_UPLOAD_DIR = "media_uploads"
os.makedirs(MEDIA_UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_current_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme), db: Session = Depends(get_db)):
    """Verify admin token"""
    token = credentials.credentials if credentials else None

    if ADMIN_STATIC_TOKEN and token == ADMIN_STATIC_TOKEN:
        return True

    if not token:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing username in token")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")
    
    # Check ADMIN_USERS env var
    if username in ADMIN_USERS:
        return True

    # Check if user is admin in database
    try:
        user = db.query(User).filter(User.username == username).first()
        if user and getattr(user, "is_admin", False):
            return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error while checking admin status: {str(e)}")

    raise HTTPException(status_code=403, detail="Admin privileges required")


# Get all courses with their lessons
@router.get("", response_model=List[CourseResponse])
def get_all_courses(db: Session = Depends(get_db)):
    try:
        courses = db.query(Course).all()
        return courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get a specific course by ID
@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Create a new course
@router.post("", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    try:
        # Check if course already exists
        existing = db.query(Course).filter(Course.id == course.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Course with this ID already exists")
        
        new_course = Course(
            id=course.id,
            name=course.name,
            level=course.level,
            description=course.description,
            lesson_type=course.lesson_type
        )
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        return new_course
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Create a new lesson for a course
@router.post("/{course_id}/lessons", response_model=LessonResponse)
def create_lesson(course_id: str, lesson: LessonCreate, db: Session = Depends(get_db)):
    try:
        # Check if course exists
        course_obj = db.query(Course).filter(Course.id == course_id).first()
        if not course_obj:
            raise HTTPException(status_code=404, detail="Course not found")
        
        new_lesson = Lesson(
            lesson_id=lesson.lesson_id,
            name=lesson.name,
            course_id=course_id,
            video_url=lesson.video_url,
            order=lesson.order
        )
        db.add(new_lesson)
        db.commit()
        db.refresh(new_lesson)
        return new_lesson
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get all lessons for a specific course
@router.get("/{course_id}/lessons", response_model=List[LessonResponse])
def get_course_lessons(course_id: str, db: Session = Depends(get_db)):
    try:
        # Check if course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
        return lessons
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Upload media file
@router.post("/media/upload")
async def upload_media_file(
    file: UploadFile = File(...),
    _admin = Depends(get_current_admin)
):
    """Upload a media file (image or video) and return its URL"""
    try:
        # Generate unique filename with timestamp (Vietnam timezone)
        timestamp = vietnam_now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(MEDIA_UPLOAD_DIR, safe_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Return URL (in production, this would be a public URL from storage service)
        # For now, return a relative path that can be served statically
        file_url = f"/media/{safe_filename}"
        return {"url": file_url, "filename": safe_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload error: {str(e)}")


# Get all lessons across all courses (for media manager)
@router.get("/lessons/all", response_model=List[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)):
    """Get all lessons from all courses"""
    try:
        lessons = db.query(Lesson).order_by(Lesson.course_id, Lesson.order).all()
        return lessons
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Update a lesson's video_url
@router.patch("/{course_id}/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson_video(
    course_id: str,
    lesson_id: int,
    lesson_update: LessonUpdate,
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin)
):
    try:
        # Check if course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if lesson exists
        lesson = db.query(Lesson).filter(
            Lesson.id == lesson_id,
            Lesson.course_id == course_id
        ).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Update video_url if provided
        if lesson_update.video_url is not None:
            lesson.video_url = lesson_update.video_url
        
        db.commit()
        db.refresh(lesson)
        return lesson
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

