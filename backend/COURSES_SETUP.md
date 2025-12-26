# Course and Lesson Database Setup

## Overview
This system now stores courses and lessons in the database instead of hardcoding them in the frontend.

## Database Tables

### 1. **courses** table
- `id` (String, Primary Key): Course identifier (e.g., "alphabet")
- `name` (String): Display name (e.g., "Vietnamese Alphabet")
- `level` (String): Difficulty level (e.g., "BEGINNER")
- `description` (Text): Course description
- `lesson_type` (String): Type of lesson (e.g., "letter", "word")

### 2. **lessons** table
- `id` (Integer, Primary Key): Auto-increment ID
- `lesson_id` (String): Lesson identifier (e.g., "a", "hello")
- `name` (String): Display name (e.g., "A", "Hello")
- `course_id` (String, Foreign Key): References courses.id
- `video_url` (String): URL to reference video/image
- `order` (Integer): Order of lesson in the course

## Setup Instructions

### 1. Create the tables (automatic on server start)
The tables will be automatically created when you start the backend server because of SQLAlchemy's `create_all()` in `main.py`.

### 2. Seed the database with initial data
Run the seed script to populate courses and lessons:

```bash
cd backend
conda activate vsl_web  # or your environment
python seed_courses.py
```

This will create:
- **Vietnamese Alphabet** (22 lessons: a, b, c, d, e, g, h, i, k, l, m, n, o, p, q, r, s, t, u, v, x, y)
- **Greeting & Basic Conversation** (6 lessons)
- **Basic Verbs** (6 lessons)
- **Common Nouns** (6 lessons)

## API Endpoints

### Get all courses
```
GET /courses
```
Returns all courses with their lessons.

### Get specific course
```
GET /courses/{course_id}
```
Returns a single course with its lessons.

### Get lessons for a course
```
GET /courses/{course_id}/lessons
```
Returns all lessons for a specific course.

### Create a new course
```
POST /courses
Body: {
  "id": "new_course",
  "name": "Course Name",
  "level": "BEGINNER",
  "description": "Description",
  "lesson_type": "word"
}
```

### Create a new lesson
```
POST /courses/{course_id}/lessons
Body: {
  "lesson_id": "lesson1",
  "name": "Lesson 1",
  "video_url": "https://...",
  "order": 0,
  "course_id": "course_id"
}
```

## Next Steps

### Frontend Integration
Update the frontend to fetch courses from the API instead of hardcoding:

```typescript
// In courses page
const fetchCourses = async () => {
  const response = await fetch('http://127.0.0.1:8000/courses')
  const courses = await response.json()
  // Use courses data
}
```

### Benefits
✅ Dynamic course management
✅ Easy to add/edit courses without code changes
✅ Centralized data management
✅ Scalable architecture
✅ Database-backed consistency

