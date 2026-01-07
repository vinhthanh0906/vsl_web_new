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
from modules.create_table import User, Course, Lesson, UserCourseEnrollment, UserLessonProgress
from modules.timezone_utils import vietnam_now
from sqlalchemy import cast, Date, extract

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


@router.get("/admin/users/{user_id}/details")
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get detailed information about a user including courses enrolled and lessons completed"""
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all courses with enrollment status
        courses = db.query(Course).all()
        
        courses_data = []
        for course in courses:
            # Get enrollment info
            enrollment = db.query(UserCourseEnrollment).filter(
                UserCourseEnrollment.user_id == user_id,
                UserCourseEnrollment.course_id == course.id
            ).first()
            
            if not enrollment:
                continue  # Skip courses user hasn't enrolled in
            
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
            
            courses_data.append({
                "id": course.id,
                "name": course.name,
                "level": course.level,
                "description": course.description,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                "completed": enrollment.completed,
                "progress_percentage": round(progress_percentage, 1),
                "lessons": lessons_data,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons
            })
        
        return {
            "user_id": user_id,
            "username": user.username,
            "email": user.email,
            "courses": courses_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching user details: {str(e)}"
        )


@router.get("/admin/dashboard/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get admin dashboard statistics"""
    try:
        # Total users (excluding admins)
        total_users = db.query(User).filter(User.is_admin.isnot(True)).count()
        
        # Active users in last 7 days (users who practiced in last 7 days)
        week_start = vietnam_now() - timedelta(days=7)
        active_users = db.query(func.count(func.distinct(UserLessonProgress.user_id))).filter(
            UserLessonProgress.last_practiced_at.isnot(None),
            UserLessonProgress.last_practiced_at >= week_start
        ).scalar() or 0
        
        # New users today (using first enrollment as proxy for new users)
        today_start = vietnam_now().replace(hour=0, minute=0, second=0, microsecond=0)
        # Count users who enrolled in their first course today
        new_enrollments_today = db.query(func.count(func.distinct(UserCourseEnrollment.user_id))).filter(
            UserCourseEnrollment.enrolled_at >= today_start
        ).scalar() or 0
        
        # Online now (users active in last 15 minutes)
        online_threshold = vietnam_now() - timedelta(minutes=15)
        online_now = db.query(func.count(func.distinct(UserLessonProgress.user_id))).filter(
            UserLessonProgress.last_practiced_at.isnot(None),
            UserLessonProgress.last_practiced_at >= online_threshold
        ).scalar() or 0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_enrollments_today,
            "online_now": online_now
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


@router.get("/admin/dashboard/daily-activity")
def get_daily_activity(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get daily activity data for chart (users only) - all 24 hours"""
    try:
        from sqlalchemy import cast, Date, extract
        
        # Get activity for last 24 hours, grouped by hour
        now = vietnam_now()
        hours_data = []
        
        # Generate data for all 24 hours in the day
        # Start from 24 hours ago and go hour by hour to now
        for i in range(24):
            hour_offset = 23 - i  # 23, 22, 21, ..., 1, 0 hours ago
            hour_start = now - timedelta(hours=hour_offset + 1)
            hour_end = now - timedelta(hours=hour_offset)
            
            # Count distinct users who practiced in this hour
            users_count = db.query(func.count(func.distinct(UserLessonProgress.user_id))).filter(
                UserLessonProgress.last_practiced_at.isnot(None),
                UserLessonProgress.last_practiced_at >= hour_start,
                UserLessonProgress.last_practiced_at < hour_end
            ).scalar() or 0
            
            # Format time as HH:00 (using the start hour)
            time_str = hour_start.strftime("%H:00")
            hours_data.append({
                "time": time_str,
                "users": users_count
            })
        
        return hours_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching daily activity: {str(e)}"
        )


@router.get("/admin/dashboard/course-stats")
def get_course_stats(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get course enrollment and completion statistics"""
    try:
        courses = db.query(Course).all()
        course_stats = []
        
        for course in courses:
            # Count enrolled users
            enrolled_users = db.query(func.count(func.distinct(UserCourseEnrollment.user_id))).filter(
                UserCourseEnrollment.course_id == course.id
            ).scalar() or 0
            
            # Count completed users
            completed_users = db.query(func.count(func.distinct(UserCourseEnrollment.user_id))).filter(
                UserCourseEnrollment.course_id == course.id,
                UserCourseEnrollment.completed == True
            ).scalar() or 0
            
            # Calculate completion rate
            completion_rate = round((completed_users / enrolled_users * 100) if enrolled_users > 0 else 0, 1)
            
            course_stats.append({
                "name": course.name,
                "users": enrolled_users,
                "completionRate": completion_rate
            })
        
        return course_stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching course stats: {str(e)}"
        )


@router.get("/admin/activity/metrics")
def get_activity_metrics(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get key activity metrics"""
    try:
        # Total sessions = number of login events (sessions start at login)
        # A session ends at logout OR after 30 minutes of inactivity
        week_start = vietnam_now() - timedelta(days=7)
        session_timeout_minutes = 30
        
        # Get all login events in the last 7 days
        login_events = db.query(ActivityLog).filter(
            ActivityLog.event_type == "login",
            ActivityLog.user_id.isnot(None),
            ActivityLog.created_at >= week_start
        ).order_by(ActivityLog.created_at).all()
        
        total_sessions = len(login_events)
        
        # Calculate average session duration
        session_durations = []
        now = vietnam_now()
        
        for login_event in login_events:
            # Find corresponding logout event for this user after login
            logout_event = db.query(ActivityLog).filter(
                ActivityLog.user_id == login_event.user_id,
                ActivityLog.event_type == "logout",
                ActivityLog.created_at > login_event.created_at
            ).order_by(ActivityLog.created_at).first()
            
            if logout_event:
                # Session ended with explicit logout
                duration = (logout_event.created_at - login_event.created_at).total_seconds() / 60
                session_durations.append(duration)
            else:
                # No logout event - check last activity or assume timeout
                last_activity = db.query(func.max(UserLessonProgress.last_practiced_at)).filter(
                    UserLessonProgress.user_id == login_event.user_id,
                    UserLessonProgress.last_practiced_at >= login_event.created_at
                ).scalar()
                
                if last_activity:
                    # Session ended at last activity + timeout, or still active
                    session_end = last_activity + timedelta(minutes=session_timeout_minutes)
                    if session_end < now:
                        # Session expired
                        duration = (session_end - login_event.created_at).total_seconds() / 60
                    else:
                        # Session still active, use current time
                        duration = (now - login_event.created_at).total_seconds() / 60
                    session_durations.append(duration)
                else:
                    # No activity after login, assume session timeout
                    duration = min(session_timeout_minutes, (now - login_event.created_at).total_seconds() / 60)
                    session_durations.append(duration)
        
        avg_duration_minutes = round(sum(session_durations) / len(session_durations), 1) if session_durations else 0
        
        # Lessons completed (in last 7 days)
        lessons_completed = db.query(func.count(UserLessonProgress.id)).filter(
            UserLessonProgress.completed == True,
            UserLessonProgress.first_completed_at.isnot(None),
            UserLessonProgress.first_completed_at >= week_start
        ).scalar() or 0
        
        # Total practice time (in hours) - based on practice attempts
        total_attempts = db.query(func.sum(UserLessonProgress.total_attempts)).filter(
            UserLessonProgress.last_practiced_at.isnot(None),
            UserLessonProgress.last_practiced_at >= week_start
        ).scalar() or 0
        practice_hours = round((total_attempts * 3) / 60, 1)
        
        return {
            "total_sessions": total_sessions,
            "avg_duration_minutes": avg_duration_minutes,
            "lessons_completed": lessons_completed,
            "practice_hours": practice_hours
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching activity metrics: {str(e)}"
        )


@router.get("/admin/activity/hourly")
def get_hourly_activity(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get hourly activity data for the last 24 hours"""
    try:
        now = vietnam_now()
        hourly_data = []
        
        # Generate data for last 24 hours
        for i in range(24):
            hour_offset = 23 - i
            hour_start = now - timedelta(hours=hour_offset + 1)
            hour_end = now - timedelta(hours=hour_offset)
            
            # Count logins (from activity logs)
            logins = db.query(func.count(ActivityLog.id)).filter(
                ActivityLog.event_type == "login",
                ActivityLog.created_at >= hour_start,
                ActivityLog.created_at < hour_end
            ).scalar() or 0
            
            # Count practices (distinct users practicing in this hour)
            practices = db.query(func.count(func.distinct(UserLessonProgress.user_id))).filter(
                UserLessonProgress.last_practiced_at.isnot(None),
                UserLessonProgress.last_practiced_at >= hour_start,
                UserLessonProgress.last_practiced_at < hour_end
            ).scalar() or 0
            
            # Count lessons completed in this hour
            lessons = db.query(func.count(UserLessonProgress.id)).filter(
                UserLessonProgress.completed == True,
                UserLessonProgress.first_completed_at.isnot(None),
                UserLessonProgress.first_completed_at >= hour_start,
                UserLessonProgress.first_completed_at < hour_end
            ).scalar() or 0
            
            hour_str = hour_start.strftime("%H:00")
            hourly_data.append({
                "hour": hour_str,
                "logins": logins,
                "practices": practices,
                "lessons": lessons
            })
        
        return hourly_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching hourly activity: {str(e)}"
        )


@router.get("/admin/activity/daily")
def get_daily_activity_stats(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get daily activity statistics for the last 7 days"""
    try:
        now = vietnam_now()
        daily_data = []
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for i in range(7):
            day_offset = 6 - i
            day_start = (now - timedelta(days=day_offset)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            # Count distinct users active on this day
            users = db.query(func.count(func.distinct(UserLessonProgress.user_id))).filter(
                UserLessonProgress.last_practiced_at.isnot(None),
                UserLessonProgress.last_practiced_at >= day_start,
                UserLessonProgress.last_practiced_at < day_end
            ).scalar() or 0
            
            # Count sessions (login events on this day)
            sessions = db.query(func.count(ActivityLog.id)).filter(
                ActivityLog.event_type == "login",
                ActivityLog.user_id.isnot(None),
                ActivityLog.created_at >= day_start,
                ActivityLog.created_at < day_end
            ).scalar() or 0
            
            # Count completions
            completions = db.query(func.count(UserLessonProgress.id)).filter(
                UserLessonProgress.completed == True,
                UserLessonProgress.first_completed_at.isnot(None),
                UserLessonProgress.first_completed_at >= day_start,
                UserLessonProgress.first_completed_at < day_end
            ).scalar() or 0
            
            day_name = day_names[day_start.weekday()]
            daily_data.append({
                "day": day_name,
                "users": users,
                "sessions": sessions,
                "completions": completions
            })
        
        return daily_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching daily activity: {str(e)}"
        )


@router.get("/admin/activity/course-usage")
def get_course_usage(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Get course usage distribution"""
    try:
        courses = db.query(Course).all()
        total_practices = db.query(func.count(UserLessonProgress.id)).filter(
            UserLessonProgress.last_practiced_at.isnot(None)
        ).scalar() or 1  # Avoid division by zero
        
        course_usage = []
        for course in courses:
            # Count practices for this course
            practices = db.query(func.count(UserLessonProgress.id)).filter(
                UserLessonProgress.course_id == course.id,
                UserLessonProgress.last_practiced_at.isnot(None)
            ).scalar() or 0
            
            percentage = round((practices / total_practices) * 100, 1) if total_practices > 0 else 0
            
            course_usage.append({
                "name": course.name,
                "value": percentage
            })
        
        return course_usage
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching course usage: {str(e)}"
        )


@router.get("/admin/activity/recent")
def get_recent_activity(
    db: Session = Depends(get_db),
    limit: int = 20,
    _admin=Depends(get_current_admin)
):
    """Get recent activity log entries"""
    try:
        # Get recent activity logs
        activities = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
        
        # Also get recent lesson completions
        recent_completions = db.query(
            UserLessonProgress,
            Lesson,
            User
        ).join(
            Lesson, UserLessonProgress.lesson_id == Lesson.id
        ).join(
            User, UserLessonProgress.user_id == User.id
        ).filter(
            UserLessonProgress.completed == True,
            UserLessonProgress.first_completed_at.isnot(None)
        ).order_by(
            UserLessonProgress.first_completed_at.desc()
        ).limit(limit).all()
        
        recent_activity = []
        
        # Process activity logs
        for activity in activities:
            user = db.query(User).filter(User.id == activity.user_id).first() if activity.user_id else None
            username = user.username if user else "System"
            
            # Format time ago
            time_ago = format_time_ago(activity.created_at)
            
            recent_activity.append({
                "id": activity.id,
                "user": username,
                "action": format_action(activity.event_type),
                "details": activity.detail or "",
                "time": time_ago,
                "timestamp": activity.created_at.isoformat() if activity.created_at else None
            })
        
        # Process lesson completions
        for progress, lesson, user in recent_completions:
            time_ago = format_time_ago(progress.first_completed_at)
            recent_activity.append({
                "id": f"completion-{progress.id}",
                "user": user.username,
                "action": "Completed Lesson",
                "details": f"{lesson.name} - {lesson.course_id}",
                "time": time_ago,
                "timestamp": progress.first_completed_at.isoformat() if progress.first_completed_at else None
            })
        
        # Sort by timestamp (most recent first) and limit
        recent_activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)
        return recent_activity[:limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching recent activity: {str(e)}"
        )


def format_action(event_type: str) -> str:
    """Format event type to readable action"""
    action_map = {
        "login": "Logged In",
        "view_lesson": "Viewed Lesson",
        "complete_lesson": "Completed Lesson",
        "start_practice": "Started Practice",
        "logout": "Logged Out"
    }
    return action_map.get(event_type, event_type.replace("_", " ").title())


def format_time_ago(timestamp) -> str:
    """Format timestamp to relative time string"""
    if not timestamp:
        return "Unknown"
    
    now = vietnam_now()
    
    # Handle string timestamps
    if isinstance(timestamp, str):
        try:
            # Try parsing ISO format
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except:
            try:
                # Try parsing common formats
                timestamp = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S")
            except:
                return "Unknown"
    
    # Ensure timestamp is timezone-aware
    if timestamp.tzinfo is None:
        # Assume it's in Vietnam timezone if naive
        from modules.timezone_utils import VIETNAM_TZ
        timestamp = timestamp.replace(tzinfo=VIETNAM_TZ)
    
    diff = now - timestamp
    
    if diff.total_seconds() < 60:
        return f"{int(diff.total_seconds())} sec ago"
    elif diff.total_seconds() < 3600:
        return f"{int(diff.total_seconds() / 60)} min ago"
    elif diff.total_seconds() < 86400:
        return f"{int(diff.total_seconds() / 3600)} hrs ago"
    else:
        return f"{int(diff.total_seconds() / 86400)} days ago"

