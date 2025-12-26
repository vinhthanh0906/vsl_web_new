from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True


# Lesson Schemas
class LessonBase(BaseModel):
    lesson_id: str
    name: str
    video_url: Optional[str] = None
    order: int = 0

class LessonCreate(LessonBase):
    course_id: str

class LessonResponse(LessonBase):
    id: int
    course_id: str

    class Config:
        orm_mode = True


# Course Schemas
class CourseBase(BaseModel):
    id: str
    name: str
    level: str
    description: str
    lesson_type: str

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    lessons: List[LessonResponse] = []

    class Config:
        orm_mode = True
