# User System Architecture

## Overview
This document describes the system architecture specifically for the **User-facing** functionality of the VSL (Vietnamese Sign Language) Learning Platform. This covers the learning experience, practice sessions, progress tracking, and user authentication.

## Architecture Diagram

The system architecture diagram is available in PlantUML format: `USER_SYSTEM_ARCHITECTURE.puml`

## System Components

### 1. Frontend Layer (Next.js/React)

#### Landing & Navigation
- **Landing Page** (`/`)
  - Hero section with platform introduction
  - Feature highlights
  - Quick links to Courses, Practice, Progress
  - Public access (no authentication required)

- **Navbar Component**
  - Navigation menu
  - User authentication status
  - Links to all major sections

#### Authentication Pages

1. **Login Page** (`/auth/login`)
   - Email and password input
   - Calls `POST /auth/login`
   - Stores JWT token and user data in localStorage
   - Redirects to profile on success

2. **Signup Page** (`/auth/signup`)
   - Username, email, password registration
   - Calls `POST /auth/register`
   - Auto-login after successful registration

3. **Auth Utils** (`lib/api.ts`)
   - Token management
   - User session validation
   - Logout functionality

#### User Pages

1. **Courses Page** (`/courses`)
   - Browse all available courses
   - View course details and lessons
   - Watch reference videos/images
   - Track lesson completion status
   - Navigate to practice sessions
   - Calls: `GET /courses`, `GET /courses/lessons/all`

2. **Practice Page** (`/practice`)
   - Real-time sign language practice
   - Camera feed with live detection
   - Target lesson display
   - Detection statistics
   - Success feedback (congrats popup)
   - Calls: `POST /yolo/predict`, `POST /progress/lesson/complete`

3. **Progress Page** (`/progress`)
   - User progress dashboard
   - Course completion tracking
   - Lesson statistics
   - Practice consistency charts
   - Top lessons practiced
   - Daily/weekly/monthly stats
   - Calls: `GET /progress/user/{id}`, `/stats`, `/daily-stats`, etc.

4. **Profile Page** (`/profile`)
   - User profile information
   - Account settings
   - Calls: `GET /auth/profile`

#### Practice Components

- **Camera Feed Component**
  - Web camera access
  - Frame capture and encoding
  - Real-time YOLO detection
  - Bounding box visualization
  - Detection result display

- **Detection Stats Component**
  - Total detections count
  - Average accuracy
  - Real-time statistics

- **Progress Chart Component**
  - Visual progress representation
  - Course completion graphs
  - Time-based analytics

- **Congrats Popup Component**
  - Success notification
  - Celebration animation
  - Appears on correct sign detection

### 2. Backend Layer (FastAPI)

#### Authentication & Authorization

**User Registration** (`POST /auth/register`)
- Accepts username, email, password
- Hashes password
- Creates user record
- Generates JWT token
- Returns token and user info

**User Login** (`POST /auth/login`)
- Accepts email and password
- Verifies credentials
- Generates JWT token
- Returns token and user info

**Token Validation**
- Validates JWT on protected endpoints
- Extracts user information
- Handles token expiration

#### User API Endpoints

**Courses API** (`/courses`)
- `GET /courses` - List all courses (public)
- `GET /courses/{course_id}` - Get course details
- `GET /courses/{course_id}/lessons` - Get lessons for course
- `GET /courses/lessons/all` - Get all lessons (public)

**YOLO Prediction API** (`POST /yolo/predict`)
- Accepts base64-encoded image
- Runs YOLO model inference
- Returns detections (class, confidence, bbox)
- Real-time processing

**Progress API** (`/progress`)
- `GET /progress/user/{user_id}` - Get complete user progress
- `GET /progress/user/{user_id}/stats` - Get user statistics
- `GET /progress/user/{user_id}/daily-stats` - Get daily statistics
- `GET /progress/user/{user_id}/practice-consistency` - Get practice consistency
- `GET /progress/user/{user_id}/top-lessons` - Get top practiced lessons
- `POST /progress/lesson/complete` - Mark lesson as complete
- `POST /progress/course/enroll` - Enroll in course

**Activity Logging** (`POST /auth/log`)
- Logs user activities
- Tracks: login, view_lesson, complete_lesson, etc.
- Stores in activity_logs table

### 3. Machine Learning Layer

**YOLO Model**
- Model file: `fullalphabet_yolo_v11s.pt`
- Loaded once at server startup
- Processes frames in real-time
- Returns:
  - Detected class (sign letter/word)
  - Confidence score (0-1)
  - Bounding box coordinates [x1, y1, x2, y2]

**YOLO Service**
- Handles model loading
- Image preprocessing
- Inference execution
- Result formatting

### 4. Database Layer (PostgreSQL)

#### Core Tables

**users**
- User account information
- Authentication credentials
- Admin flag

**courses**
- Course definitions
- Level, description, lesson type

**lessons**
- Individual lessons
- Reference video/image URLs
- Ordering within course

**user_course_enrollments**
- User-course relationships
- Enrollment tracking
- Course completion status
- Progress percentage

**user_lesson_progress**
- Detailed lesson progress
- Attempt counts
- Detection statistics
- Accuracy tracking
- Completion timestamps

**activity_logs**
- User activity history
- Event tracking
- Timestamp logging

### 5. File Storage

**Media Storage** (`media_uploads/`)
- Reference videos for lessons
- Reference images
- Served statically by FastAPI
- Referenced by lessons via `video_url`

## User Flows

### Registration & Login Flow

```
1. User visits /auth/signup
2. Enters username, email, password
3. POST /auth/register
4. Backend creates user, hashes password
5. Returns JWT token
6. Frontend stores token in localStorage
7. Redirects to profile/courses
```

### Course Browsing Flow

```
1. User visits /courses
2. Frontend calls GET /courses
3. Backend returns all courses
4. User selects a course
5. Frontend calls GET /courses/{id}/lessons
6. Displays lessons with completion status
7. User can watch reference videos
8. User clicks "Start Lesson" → Navigate to /practice
```

### Practice Session Flow

```
1. User navigates to /practice?section={course}&lesson={lesson_id}
2. Practice page loads
3. Camera feed component initializes
4. Requests camera access
5. Starts real-time detection loop:
   a. Capture frame from camera
   b. Convert to base64
   c. POST /yolo/predict with image
   d. YOLO model processes frame
   e. Returns detections
   f. Draw bounding boxes on canvas
   g. Compare detection with target lesson
   h. If match → Show congrats popup
   i. Save progress to database
6. User continues practicing
7. Stats update in real-time
```

### Progress Tracking Flow

```
1. User visits /progress
2. Frontend calls GET /progress/user/{id}
3. Backend queries:
   - User progress table
   - Course enrollments
   - Lesson completions
   - Activity logs
4. Returns comprehensive progress data
5. Frontend displays:
   - Course completion percentages
   - Lesson statistics
   - Practice charts
   - Daily/weekly stats
   - Top lessons
```

## Real-Time Detection Process

### Frame Processing Pipeline

```
1. Camera Capture
   └─> Web Camera API
       └─> Video stream

2. Frame Extraction
   └─> Canvas capture
       └─> Convert to base64 JPEG

3. API Request
   └─> POST /yolo/predict
       └─> Body: { "image": "data:image/jpeg;base64,..." }

4. Backend Processing
   └─> Decode base64 image
       └─> Convert to OpenCV format
           └─> Run YOLO inference
               └─> Extract detections

5. Response
   └─> JSON: { "detections": [
         {
           "class": "a",
           "confidence": 0.95,
           "bbox": [x1, y1, x2, y2]
         }
       ]}

6. Frontend Rendering
   └─> Draw bounding boxes
       └─> Update statistics
           └─> Check for match
               └─> Show feedback
```

## Data Flow Examples

### Complete Lesson Practice

```
User starts practice
  ↓
Camera feed captures frame
  ↓
POST /yolo/predict (frame data)
  ↓
YOLO model detects sign
  ↓
Returns: { class: "a", confidence: 0.92 }
  ↓
Frontend compares with target lesson
  ↓
Match detected! (class === target)
  ↓
Show congrats popup
  ↓
POST /progress/lesson/complete
  {
    user_id: 1,
    course_id: "alphabet",
    lesson_id: "a",
    accuracy: 92
  }
  ↓
Backend updates user_lesson_progress
  ↓
POST /auth/log (activity)
  {
    event_type: "complete_lesson",
    lesson_id: "a"
  }
  ↓
Activity logged in database
```

### View Progress Dashboard

```
User visits /progress
  ↓
GET /progress/user/1
  ↓
Backend queries:
  - user_lesson_progress (completed lessons)
  - user_course_enrollments (enrollments)
  - activity_logs (recent activity)
  ↓
Returns comprehensive progress data
  ↓
GET /progress/user/1/stats
  ↓
Returns: total lessons, accuracy, practice hours
  ↓
GET /progress/user/1/daily-stats?days=7
  ↓
Returns: daily practice statistics
  ↓
GET /progress/user/1/practice-consistency?days=7
  ↓
Returns: practice consistency data
  ↓
Frontend renders charts and statistics
```

## Security Features

1. **JWT Token Authentication**
   - Secure token-based authentication
   - Token stored in localStorage
   - Included in API requests via Authorization header

2. **Password Hashing**
   - Passwords hashed using bcrypt
   - Never stored in plain text
   - Secure verification

3. **Route Protection**
   - Protected routes require authentication
   - Automatic redirect to login if not authenticated
   - Token validation on backend

4. **CORS Configuration**
   - Configured for frontend origin
   - Secure cross-origin requests

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | None | User registration |
| `/auth/login` | POST | None | User login |
| `/auth/profile` | GET | User | Get user profile |
| `/auth/log` | POST | None | Log user activity |
| `/courses` | GET | None | List all courses |
| `/courses/{id}` | GET | None | Get course details |
| `/courses/{id}/lessons` | GET | None | Get course lessons |
| `/courses/lessons/all` | GET | None | Get all lessons |
| `/yolo/predict` | POST | None | YOLO detection |
| `/progress/user/{id}` | GET | None | Get user progress |
| `/progress/user/{id}/stats` | GET | None | Get user stats |
| `/progress/user/{id}/daily-stats` | GET | None | Get daily stats |
| `/progress/user/{id}/practice-consistency` | GET | None | Get consistency |
| `/progress/user/{id}/top-lessons` | GET | None | Get top lessons |
| `/progress/lesson/complete` | POST | None | Mark lesson complete |
| `/progress/course/enroll` | POST | None | Enroll in course |

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL
- **ML Model**: YOLO (Ultralytics)
- **Computer Vision**: OpenCV
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem (`media_uploads/`)
- **Camera API**: Web MediaDevices API

## Key Features

### 1. **Real-Time Sign Detection**
- Live camera feed
- Real-time YOLO inference
- Visual feedback with bounding boxes
- Accuracy scoring

### 2. **Progress Tracking**
- Lesson completion tracking
- Course enrollment
- Practice statistics
- Accuracy trends
- Practice consistency

### 3. **Interactive Learning**
- Reference videos/images
- Structured course progression
- Practice sessions
- Success celebrations

### 4. **Analytics & Insights**
- Daily/weekly/monthly statistics
- Practice consistency tracking
- Top lessons practiced
- Progress visualization

## Performance Considerations

1. **YOLO Model Loading**
   - Model loaded once at startup
   - Cached in memory
   - Fast inference times

2. **Frame Processing**
   - Base64 encoding on client
   - Efficient image transmission
   - Async processing

3. **Database Queries**
   - Indexed foreign keys
   - Optimized progress queries
   - Cached course data

4. **Frontend Optimization**
   - React component memoization
   - Efficient state management
   - Lazy loading of components

## Future Enhancements

1. WebSocket support for real-time updates
2. Offline progress tracking
3. Social features (leaderboards, sharing)
4. Advanced analytics dashboard
5. Personalized learning paths
6. Multi-language support
7. Mobile app version
8. Video call practice sessions




