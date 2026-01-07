from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import sys

sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")

from modules.database import SessionLocal
from modules.create_table import User, Course, Lesson, UserCourseEnrollment, UserLessonProgress
from modules.timezone_utils import vietnam_now

router = APIRouter(prefix="/progress", tags=["progress"])

def get_db():
    db = SessionLocal()
    try:
        yield db
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
    """
    Mark a lesson as complete for a user.
    Expected data: {
        "user_id": int,
        "course_id": str,
        "lesson_id": str,
        "accuracy": float (optional)
    }
    """
    try:
        user_id = data.get("user_id")
        course_id = data.get("course_id")
        lesson_id = data.get("lesson_id")
        accuracy = data.get("accuracy", 0.0)
        
        if not all([user_id, course_id, lesson_id]):
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, course_id, lesson_id")
        
        # Get lesson by lesson_id
        lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id, Lesson.course_id == course_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Get or create progress record
        progress = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.lesson_id == lesson.id
        ).first()
        
        if not progress:
            progress = UserLessonProgress(
                user_id=user_id,
                lesson_id=lesson.id,
                course_id=course_id,
                completed=False,
                total_attempts=0,
                successful_detections=0,
                best_accuracy=0.0
            )
            db.add(progress)
        
        # Update progress
        progress.total_attempts = (progress.total_attempts or 0) + 1
        progress.last_practiced_at = vietnam_now()
        
        # Update accuracy if provided
        current_successful_detections = progress.successful_detections or 0
        if accuracy > 0:
            if not progress.best_accuracy or accuracy > progress.best_accuracy:
                progress.best_accuracy = accuracy
            progress.successful_detections = current_successful_detections + 1
        
        # Mark as completed on first successful detection
        # Since the frontend only calls this API when a match is detected, mark as complete immediately
        if not progress.completed and accuracy > 0:
                progress.completed = True
                if not progress.first_completed_at:
                    progress.first_completed_at = vietnam_now()
        
        db.commit()
        db.refresh(progress)
        
        # Update course enrollment progress
        enrollment = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id,
            UserCourseEnrollment.course_id == course_id
        ).first()
        
        if not enrollment:
            enrollment = UserCourseEnrollment(
                user_id=user_id,
                course_id=course_id,
                enrolled_at=vietnam_now(),
                completed=False,
                progress_percentage=0.0
            )
            db.add(enrollment)
        
        # Calculate course progress
        all_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
        total_lessons = len(all_lessons)
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
            enrollment.completed_at = vietnam_now()
        
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
        
        if not all([user_id, course_id]):
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, course_id")
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already enrolled
        existing = db.query(UserCourseEnrollment).filter(
            UserCourseEnrollment.user_id == user_id,
            UserCourseEnrollment.course_id == course_id
        ).first()
        
        if existing:
            return {"message": "User already enrolled in this course", "enrollment": existing}
        
        # Create enrollment
        enrollment = UserCourseEnrollment(
            user_id=user_id,
            course_id=course_id,
            enrolled_at=vietnam_now(),
            completed=False,
            progress_percentage=0.0
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        return {"message": "Successfully enrolled in course", "enrollment": enrollment}
        
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
        
        # Total successful detections for THIS WEEK
        # Calculate start of week (7 days ago)
        week_start = vietnam_now() - timedelta(days=7)
        
        total_detections_this_week = db.query(
            func.sum(UserLessonProgress.successful_detections)
        ).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.last_practiced_at.isnot(None),
            UserLessonProgress.last_practiced_at >= week_start
        ).scalar() or 0
        
        # Average accuracy across ALL sessions (not just completed lessons)
        # Calculate average from all progress records with accuracy > 0
        avg_accuracy = db.query(
            func.avg(UserLessonProgress.best_accuracy)
        ).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.best_accuracy > 0
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
        
        # Calculate practice hours
        # Estimate: average 3 minutes per practice attempt
        total_attempts = db.query(
            func.sum(UserLessonProgress.total_attempts)
        ).filter(
            UserLessonProgress.user_id == user_id
        ).scalar() or 0
        
        # Convert minutes to hours (3 minutes per attempt)
        practice_hours = round((total_attempts * 3) / 60, 1) if total_attempts > 0 else 0.0
        
        return {
            "user_id": user_id,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "completion_percentage": round((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0, 1),
            "total_detections": int(total_detections_this_week),
            "average_accuracy": round(float(avg_accuracy), 1),
            "enrolled_courses": enrolled_courses,
            "completed_courses": completed_courses,
            "practice_hours": practice_hours
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get daily statistics for charts
@router.get("/user/{user_id}/daily-stats")
def get_daily_stats(user_id: int, days: int = 7, db: Session = Depends(get_db)):
    """Get daily detection and accuracy statistics for the last N days"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate date range (using Vietnam timezone)
        end_date = vietnam_now().date()
        start_date = end_date - timedelta(days=days - 1)
        
        # Get all progress records for the user within the date range
        from sqlalchemy import cast, Date
        progress_records = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.last_practiced_at.isnot(None),
            cast(UserLessonProgress.last_practiced_at, Date) >= start_date,
            cast(UserLessonProgress.last_practiced_at, Date) <= end_date
        ).all()
        
        # Group by date
        daily_data = {}
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        # Initialize all days with zeros
        for i in range(days):
            date = start_date + timedelta(days=i)
            day_name = day_names[date.weekday()]
            daily_data[date.isoformat()] = {
                "date": day_name,
                "detections": 0,
                "accuracy": 0,
                "accuracy_count": 0,
                "accuracy_sum": 0
            }
        
        # Aggregate data by date
        for progress in progress_records:
            if progress.last_practiced_at:
                date_key = progress.last_practiced_at.date().isoformat()
                if date_key in daily_data:
                    daily_data[date_key]["detections"] += progress.successful_detections or 0
                    if progress.best_accuracy and progress.best_accuracy > 0:
                        daily_data[date_key]["accuracy_sum"] += progress.best_accuracy
                        daily_data[date_key]["accuracy_count"] += 1
        
        # Calculate average accuracy for each day
        result = []
        for date_key in sorted(daily_data.keys()):
            day_data = daily_data[date_key]
            avg_accuracy = 0
            if day_data["accuracy_count"] > 0:
                avg_accuracy = round(day_data["accuracy_sum"] / day_data["accuracy_count"], 1)
            
            result.append({
                "date": day_data["date"],
                "detections": day_data["detections"],
                "accuracy": avg_accuracy
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get practice consistency (sessions per day)
@router.get("/user/{user_id}/practice-consistency")
def get_practice_consistency(user_id: int, days: int = 7, db: Session = Depends(get_db)):
    """Get practice sessions per day for the last N days"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate date range (using Vietnam timezone)
        end_date = vietnam_now().date()
        start_date = end_date - timedelta(days=days - 1)
        
        # Get all progress records with last_practiced_at in the date range
        from sqlalchemy import cast, Date
        # Count distinct lessons practiced per day (each unique lesson = 1 session)
        progress_records = db.query(
            cast(UserLessonProgress.last_practiced_at, Date).label('practice_date'),
            func.count(func.distinct(UserLessonProgress.lesson_id)).label('sessions')
        ).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.last_practiced_at.isnot(None),
            cast(UserLessonProgress.last_practiced_at, Date) >= start_date,
            cast(UserLessonProgress.last_practiced_at, Date) <= end_date
        ).group_by(cast(UserLessonProgress.last_practiced_at, Date)).all()
        
        # Create a map of date to sessions
        sessions_by_date = {str(record.practice_date): record.sessions for record in progress_records}
        
        # Initialize all days with zeros
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        result = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_str = date.isoformat()
            day_name = day_names[date.weekday()]
            sessions = sessions_by_date.get(date_str, 0)
            
            result.append({
                "day": day_name,
                "sessions": sessions
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get top lessons by detections
@router.get("/user/{user_id}/top-lessons")
def get_top_lessons(user_id: int, limit: int = 5, db: Session = Depends(get_db)):
    """Get top lessons by number of detections"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all progress records for the user with lesson information
        progress_records = db.query(
            Lesson.name.label('lesson_name'),
            func.sum(UserLessonProgress.successful_detections).label('total_detections'),
            func.avg(UserLessonProgress.best_accuracy).label('avg_accuracy')
        ).join(
            Lesson, UserLessonProgress.lesson_id == Lesson.id
        ).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.successful_detections > 0
        ).group_by(
            Lesson.id, Lesson.name
        ).order_by(
            func.sum(UserLessonProgress.successful_detections).desc()
        ).limit(limit).all()
        
        result = []
        for record in progress_records:
            result.append({
                "name": record.lesson_name,
                "count": int(record.total_detections or 0),
                "accuracy": round(float(record.avg_accuracy or 0), 1)
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
