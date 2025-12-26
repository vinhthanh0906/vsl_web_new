from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys

sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")

from modules.database import SessionLocal
from modules.create_table import Course, Lesson
from modules.schemas import CourseCreate, CourseResponse, LessonCreate, LessonResponse

router = APIRouter(prefix="/courses", tags=["courses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


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

