import sys
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func


sys.path.append("/Users/hungcucu/Documents/vsl_web_new/backend/modules")
from modules.database import Base



class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    event_type = Column(String, nullable=False)   # "login", "view_lesson", "complete_lesson", ...
    detail = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LessonCompletion(Base):
    __tablename__ = "lesson_completions"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    progress = Column(Float, default=100.0)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())