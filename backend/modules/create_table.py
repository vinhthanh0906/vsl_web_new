from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from modules.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    enrollments = relationship("UserCourseEnrollment", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String, primary_key=True, index=True)  # e.g., "alphabet", "greetings"
    name = Column(String, nullable=False)  # e.g., "Vietnamese Alphabet"
    level = Column(String, nullable=False)  # e.g., "BEGINNER", "INTERMEDIATE"
    description = Column(Text, nullable=False)
    lesson_type = Column(String, nullable=False)  # e.g., "letter", "word"
    
    # Relationships
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("UserCourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(String, nullable=False, index=True)  # e.g., "a", "b", "hello"
    name = Column(String, nullable=False)  # e.g., "A", "B", "Hello"
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    video_url = Column(String, nullable=True)  # URL to reference video/image
    order = Column(Integer, default=0)  # For ordering lessons within a course
    
    # Relationships
    course = relationship("Course", back_populates="lessons")
    user_progress = relationship("UserLessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class UserCourseEnrollment(Base):
    """Track which courses a user is enrolled in and their completion status"""
    __tablename__ = "user_course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    progress_percentage = Column(Float, default=0.0)  # 0-100
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class UserLessonProgress(Base):
    """Track individual lesson completion and attempts"""
    __tablename__ = "user_lesson_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    
    completed = Column(Boolean, default=False)
    first_completed_at = Column(DateTime, nullable=True)
    last_practiced_at = Column(DateTime, default=datetime.utcnow)
    
    # Practice statistics
    total_attempts = Column(Integer, default=0)
    successful_detections = Column(Integer, default=0)
    best_accuracy = Column(Float, default=0.0)  # Best detection accuracy (0-100)
    
    # Relationships
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="user_progress")


