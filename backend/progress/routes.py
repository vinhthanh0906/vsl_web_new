from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
import sys

sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")

from modules.database import SessionLocal
from modules.create_table import User, Course, Lesson, UserCourseEnrollment, UserLessonProgress

router = APIRouter(prefix="/progress", tags=["progress"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Get user's overall progress
@router.get("/user/{user_id}")
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """Get complete progress for a user including all courses and lessons"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all courses with enrollment status
        courses = db.query(Course).all()
        
        result = []
        for course in courses:
            # Get enrollment info
            enrollment = db.query(UserCourseEnrollment).filter(
                UserCourseEnrollment.user_id == user_id,
                UserCourseEnrollment.course_id == course.id
            ).first()
            
            # Get lessons with progress
            lessons = db.query(Lesson).filter(Lesson.course_id == course.id).order_by(Lesson.order).all()
            
            lessons_data = []
            for lesson in lessons:
                # Get lesson progress
                progress = db.query(UserLessonProgress).filter(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.lesson_id == lesson.id
                ).first()
                
                lessons_data.append({
                    "id": lesson.lesson_id,
                    "name": lesson.name,
                    "completed": progress.completed if progress else False,
                    "total_attempts": progress.total_attempts if progress else 0,
                    "successful_detections": progress.successful_detections if progress else 0,
                    "best_accuracy": progress.best_accuracy if progress else 0.0,
                    "last_practiced": progress.last_practiced_at.isoformat() if progress and progress.last_practiced_at else None
                })
            
            # Calculate progress percentage
            completed_lessons = sum(1 for l in lessons_data if l["completed"])
            total_lessons = len(lessons_data)
            progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            
            result.append({
                "id": course.id,
                "name": course.name,
                "level": course.level,
                "description": course.description,
                "lessons": lessons_data,
                "progress": round(progress_percentage, 1),
                "enrolled": enrollment is not None if enrollment else False,
                "completed": enrollment.completed if enrollment else False
            })
        
        return {
            "user_id": user_id,
            "username": user.username,
            "email": user.email,
            "courses": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Mark lesson as complete
@router.post("/lesson/complete")
def mark_lesson_complete(
    data: dict,
    db: Session = Depends(get_db)
):
    """Mark a lesson as completed for a user"""
    try:
        user_id = data.get("user_id")
        course_id = data.get("course_id")
        lesson_id = data.get("lesson_id")
        accuracy = data.get("accuracy", 100.0)
        
        if not user_id or not course_id or not lesson_id:
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, course_id, lesson_id")
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get the lesson by lesson_id and course_id
        lesson = db.query(Lesson).filter(
            Lesson.lesson_id == lesson_id,
            Lesson.course_id == course_id
        ).first()
        
        if not lesson:
            raise HTTPException(status_code=404, detail=f"Lesson {lesson_id} not found in course {course_id}")
        
        # Check if progress entry exists
        progress = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.lesson_id == lesson.id
        ).first()
        
        if progress:
            # Update existing progress
            progress.total_attempts += 1
            progress.successful_detections += 1
            progress.last_practiced_at = datetime.utcnow()
            
            if not progress.completed:
                progress.completed = True
                progress.first_completed_at = datetime.utcnow()
            
            if accuracy > progress.best_accuracy:
                progress.best_accuracy = accuracy
        else:
            # Create new progress entry
            progress = UserLessonProgress(
                user_id=user_id,
                lesson_id=lesson.id,
                course_id=course_id,
                completed=True,
                first_completed_at=datetime.utcnow(),
                last_practiced_at=datetime.utcnow(),
                total_attempts=1,
                successful_detections=1,
                best_accuracy=accuracy
            )
            db.add(progress)
        
        # Auto-enroll user in course if not enrolled
        enrollment = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id,
            UserCourseEnrollment.course_id == course_id
        ).first()
        
        if not enrollment:
            enrollment = UserCourseEnrollment(
                user_id=user_id,
                course_id=course_id,
                enrolled_at=datetime.utcnow()
            )
            db.add(enrollment)
        
        # Update course progress percentage
        total_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).count()
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.course_id == course_id,
            UserLessonProgress.completed == True
        ).count()
        
        progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        enrollment.progress_percentage = progress_percentage
        
        # Mark course as completed if all lessons done
        if completed_lessons == total_lessons:
            enrollment.completed = True
            enrollment.completed_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Lesson marked as complete",
            "progress_percentage": round(progress_percentage, 1),
            "course_completed": enrollment.completed
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Enroll in a course
@router.post("/course/enroll")
def enroll_in_course(data: dict, db: Session = Depends(get_db)):
    """Enroll a user in a course"""
    try:
        user_id = data.get("user_id")
        course_id = data.get("course_id")
        
        if not user_id or not course_id:
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, course_id")
        # Verify user and course exist
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already enrolled
        enrollment = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id,
            UserCourseEnrollment.course_id == course_id
        ).first()
        
        if enrollment:
            return {"message": "Already enrolled", "enrollment_id": enrollment.id}
        
        # Create enrollment
        enrollment = UserCourseEnrollment(
            user_id=user_id,
            course_id=course_id,
            enrolled_at=datetime.utcnow()
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        return {
            "success": True,
            "message": "Successfully enrolled in course",
            "enrollment_id": enrollment.id
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get user statistics
@router.get("/user/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics for dashboard"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Total completed lessons
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.completed == True
        ).count()
        
        # Total lessons available
        total_lessons = db.query(Lesson).count()
        
        # Total successful detections
        total_detections = db.query(
            func.sum(UserLessonProgress.successful_detections)
        ).filter(
            UserLessonProgress.user_id == user_id
        ).scalar() or 0
        
        # Average accuracy
        avg_accuracy = db.query(
            func.avg(UserLessonProgress.best_accuracy)
        ).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.completed == True
        ).scalar() or 0
        
        # Enrolled courses
        enrolled_courses = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id
        ).count()
        
        # Completed courses
        completed_courses = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id,
            UserCourseEnrollment.completed == True
        ).count()
        
        return {
            "user_id": user_id,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "completion_percentage": round((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0, 1),
            "total_detections": int(total_detections),
            "average_accuracy": round(float(avg_accuracy), 1),
            "enrolled_courses": enrolled_courses,
            "completed_courses": completed_courses
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

