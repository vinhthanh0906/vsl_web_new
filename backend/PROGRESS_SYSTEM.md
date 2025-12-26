# User Progress Tracking System

## Overview
Complete system to track user course enrollments, lesson completions, and learning progress with database persistence.

## Database Tables

### 1. **user_course_enrollments**
Tracks which courses users are enrolled in and their overall progress.

**Columns:**
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key → users.id)
- `course_id` (String, Foreign Key → courses.id)
- `enrolled_at` (DateTime) - When user enrolled
- `completed` (Boolean) - Whether course is fully completed
- `completed_at` (DateTime) - When course was completed
- `progress_percentage` (Float) - Overall progress (0-100)

### 2. **user_lesson_progress**
Tracks individual lesson completions and practice statistics.

**Columns:**
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key → users.id)
- `lesson_id` (Integer, Foreign Key → lessons.id)
- `course_id` (String, Foreign Key → courses.id)
- `completed` (Boolean) - Whether lesson is completed
- `first_completed_at` (DateTime) - First completion timestamp
- `last_practiced_at` (DateTime) - Last practice timestamp
- `total_attempts` (Integer) - Number of practice attempts
- `successful_detections` (Integer) - Number of successful detections
- `best_accuracy` (Float) - Best detection accuracy (0-100)

## API Endpoints

### Get User Progress
```
GET /progress/user/{user_id}
```
Returns complete progress including all courses, lessons, and completion status.

**Response:**
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "courses": [
    {
      "id": "alphabet",
      "name": "Vietnamese Alphabet",
      "level": "BEGINNER",
      "description": "...",
      "progress": 45.5,
      "enrolled": true,
      "completed": false,
      "lessons": [
        {
          "id": "a",
          "name": "A",
          "completed": true,
          "total_attempts": 5,
          "successful_detections": 5,
          "best_accuracy": 98.5,
          "last_practiced": "2025-12-25T10:30:00"
        }
      ]
    }
  ]
}
```

### Mark Lesson as Complete
```
POST /progress/lesson/complete
Body: {
  "user_id": 1,
  "course_id": "alphabet",
  "lesson_id": "a",
  "accuracy": 95.5
}
```
Marks a lesson as completed and updates course progress.

**Response:**
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "progress_percentage": 45.5,
  "course_completed": false
}
```

### Enroll in Course
```
POST /progress/course/enroll
Body: {
  "user_id": 1,
  "course_id": "alphabet"
}
```
Enrolls a user in a course.

### Get User Statistics
```
GET /progress/user/{user_id}/stats
```
Returns aggregate statistics for dashboard display.

**Response:**
```json
{
  "user_id": 1,
  "completed_lessons": 10,
  "total_lessons": 46,
  "completion_percentage": 21.7,
  "total_detections": 50,
  "average_accuracy": 94.2,
  "enrolled_courses": 2,
  "completed_courses": 0
}
```

## Frontend Integration

### Practice Page
When a user successfully detects a sign, the system:
1. Saves to localStorage (offline backup)
2. Calls `/progress/lesson/complete` API
3. Updates database with completion and accuracy

```typescript
// Automatically called on successful detection
fetch("http://127.0.0.1:8000/progress/lesson/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: userData.id,
    course_id: section,
    lesson_id: lesson,
    accuracy: accuracy
  })
})
```

### Progress Page
Fetches real-time data from database:
1. Gets user progress: `/progress/user/{user_id}`
2. Gets user stats: `/progress/user/{user_id}/stats`
3. Displays courses with actual completion status

## Setup Instructions

### 1. Restart Backend Server
The new tables will be automatically created:

```bash
cd backend
conda activate vsl_web
uvicorn main:app --reload
```

### 2. Seed Courses (if not already done)
```bash
python seed_courses.py
```

### 3. Test the System

**Test Progress Tracking:**
```bash
# Mark a lesson as complete
curl -X POST "http://127.0.0.1:8000/progress/lesson/complete" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "course_id": "alphabet", "lesson_id": "a", "accuracy": 95.5}'

# Get user progress
curl "http://127.0.0.1:8000/progress/user/1"

# Get user stats
curl "http://127.0.0.1:8000/progress/user/1/stats"
```

## Features

### ✅ Automatic Course Enrollment
When a user completes their first lesson in a course, they are automatically enrolled.

### ✅ Progress Calculation
Course progress is automatically calculated based on completed lessons:
```
progress_percentage = (completed_lessons / total_lessons) * 100
```

### ✅ Auto Course Completion
When all lessons in a course are completed, the course is automatically marked as complete.

### ✅ Practice Statistics
Tracks:
- Total attempts per lesson
- Successful detections
- Best accuracy achieved
- Last practice timestamp

### ✅ Dual Storage
- Database: Persistent, multi-device
- localStorage: Offline backup, fast access

## Benefits

🎯 **Real-time Progress** - Progress updates instantly in database
📊 **Detailed Analytics** - Track attempts, accuracy, and practice patterns
🔄 **Automatic Sync** - Frontend and backend stay in sync
💾 **Persistent Storage** - Data survives page refreshes and sessions
📈 **Scalable** - Supports multiple users and courses
🏆 **Achievement Tracking** - Foundation for gamification features

## Migration from localStorage

The system maintains compatibility with existing localStorage progress:
- New completions save to both localStorage and database
- Progress page prioritizes database data
- localStorage serves as fallback for offline scenarios

## Next Steps

### Potential Enhancements
1. **Daily/Weekly Stats** - Track practice patterns over time
2. **Leaderboards** - Compare progress with other users
3. **Achievements System** - Award badges for milestones
4. **Practice Streaks** - Track consecutive days of practice
5. **Lesson Recommendations** - Suggest next lessons based on progress
6. **Export Progress** - Download progress reports

