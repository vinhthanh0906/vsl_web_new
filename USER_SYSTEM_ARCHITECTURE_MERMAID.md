# User System Architecture (Mermaid)

## System Architecture Diagram

```mermaid
graph TB
    subgraph "User Frontend (Next.js/React)"
        LandingPage[Landing Page]
        Navbar[Navbar]
        
        LoginPage[Login Page]
        SignupPage[Signup Page]
        AuthUtils[Auth Utils]
        
        CoursesPage[Courses Page]
        PracticePage[Practice Page]
        ProgressPage[Progress Page]
        ProfilePage[Profile Page]
        
        CameraFeed[Camera Feed Component]
        DetectionStats[Detection Stats]
        ProgressChart[Progress Chart]
        CongratsPopup[Congrats Popup]
        
        APIClient[API Client]
        Analytics[Analytics]
    end
    
    subgraph "User Backend (FastAPI)"
        CORS[CORS Middleware]
        
        UserRegister[User Register<br/>POST /auth/register]
        UserLogin[User Login<br/>POST /auth/login]
        JWTGen[JWT Generator]
        TokenValidator[Token Validator]
        
        CoursesAPI[Courses API<br/>GET /courses]
        YOLOAPI[YOLO Prediction API<br/>POST /yolo/predict]
        ProgressAPI[Progress API<br/>/progress/*]
        ActivityLogger[Activity Logger]
        
        CourseService[Course Service]
        YOLOService[YOLO Service]
        ProgressService[Progress Service]
        AnalyticsService[Analytics Service]
        
        BrowserMediaAPI[Browser Media Device API]
    end
    
    subgraph "ML Model"
        YOLOModel[YOLO Model<br/>fullalphabet_yolo_v11s.pt]
    end
    
    subgraph "Database (PostgreSQL)"
        UsersTable[(users<br/>id, username, email<br/>hashed_password)]
        CoursesTable[(courses<br/>id, name, level<br/>description)]
        LessonsTable[(lessons<br/>id, lesson_id, name<br/>course_id, video_url)]
        EnrollmentsTable[(user_course_enrollments)]
        ProgressTable[(user_lesson_progress<br/>attempts, accuracy<br/>completions)]
        ActivityLogsTable[(activity_logs<br/>event_type, detail)]
    end
    
    subgraph "Storage"
        MediaStorage[(media_uploads/<br/>Videos & Images)]
    end
    
    subgraph "Browser"
        WebCamera[Web Camera API]
        LocalStorage[(localStorage<br/>Token & User Data)]
    end
    
    %% Navigation
    LandingPage --> Navbar
    Navbar --> LoginPage
    Navbar --> SignupPage
    Navbar --> CoursesPage
    Navbar --> PracticePage
    Navbar --> ProgressPage
    Navbar --> ProfilePage
    
    %% Authentication
    LoginPage --> APIClient
    SignupPage --> APIClient
    APIClient --> UserLogin
    APIClient --> UserRegister
    UserLogin --> JWTGen
    UserRegister --> JWTGen
    JWTGen --> LocalStorage
    AuthUtils --> LocalStorage
    
    %% Courses
    CoursesPage --> APIClient
    APIClient --> CoursesAPI
    CoursesAPI --> CourseService
    CourseService -.->|Query| CoursesTable
    CourseService -.->|Query| LessonsTable
    CoursesPage --> MediaStorage
    
    %% Practice Flow
    PracticePage --> CameraFeed
    CameraFeed --> WebCamera
    CameraFeed --> APIClient
    APIClient --> YOLOAPI
    YOLOAPI --> YOLOService
    YOLOService --> YOLOModel
    YOLOModel --> YOLOService
    YOLOService --> BrowserMediaAPI
    BrowserMediaAPI --> YOLOService
    YOLOService --> CameraFeed
    CameraFeed --> DetectionStats
    PracticePage --> CongratsPopup
    PracticePage --> APIClient
    APIClient --> ProgressAPI
    ProgressAPI --> ProgressService
    ProgressService --> ProgressTable
    PracticePage --> Analytics
    Analytics --> ActivityLogger
    ActivityLogger --> ActivityLogsTable
    
    %% Progress
    ProgressPage --> APIClient
    APIClient --> ProgressAPI
    ProgressAPI --> ProgressService
    ProgressService --> ProgressTable
    ProgressService --> EnrollmentsTable
    ProgressService --> ActivityLogsTable
    ProgressPage --> ProgressChart
    ProgressPage --> AnalyticsService
    
    %% Profile
    ProfilePage --> APIClient
    APIClient --> TokenValidator
    TokenValidator --> UsersTable
    
    %% Layout: Position Database to the right of Backend
    CORS -.->|" "| UsersTable
    
    %% Database Relationships
    UsersTable -.->|FK| EnrollmentsTable
    UsersTable -.->|FK| ProgressTable
    UsersTable -.->|FK| ActivityLogsTable
    CoursesTable -.->|FK| LessonsTable
    CoursesTable -.->|FK| EnrollmentsTable
    LessonsTable -.->|FK| ProgressTable
    
    style PracticePage fill:#FF6B35
    style CameraFeed fill:#FF6B35
    style YOLOModel fill:#00D9FF
    style YOLOAPI fill:#00D9FF
    style ProgressTable fill:#A23B72
    style CoursesTable fill:#A23B72
```

## User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage as Login Page
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL
    participant LocalStorage as Browser Storage
    
    User->>LoginPage: Enter email & password
    LoginPage->>Backend: POST /auth/login
    Backend->>DB: Verify credentials
    DB-->>Backend: User record
    Backend->>Backend: Generate JWT token
    Backend-->>LoginPage: Return token + user data
    LoginPage->>LocalStorage: Store token & user
    LoginPage->>User: Redirect to profile/courses
    
    Note over User,LocalStorage: Token used for all<br/>subsequent API requests
```

## Practice Session Flow

```mermaid
sequenceDiagram
    participant User
    participant PracticePage as Practice Page
    participant CameraFeed as Camera Feed
    participant YOLOAPI as YOLO API
    participant YOLOModel as YOLO Model
    participant ProgressAPI as Progress API
    participant DB as Database
    
    User->>PracticePage: Start practice session
    PracticePage->>CameraFeed: Initialize camera
    CameraFeed->>CameraFeed: Capture frame
    
    loop Real-time Detection
        CameraFeed->>YOLOAPI: POST /yolo/predict<br/>(base64 image)
        YOLOAPI->>YOLOModel: Run inference
        YOLOModel-->>YOLOAPI: Detections (class, confidence, bbox)
        YOLOAPI-->>CameraFeed: Return detections
        CameraFeed->>CameraFeed: Draw bounding boxes
        CameraFeed->>PracticePage: Update detections
        
        alt Match Detected
            PracticePage->>PracticePage: Show congrats popup
            PracticePage->>ProgressAPI: POST /progress/lesson/complete
            ProgressAPI->>DB: Save progress
            DB-->>ProgressAPI: Success
            ProgressAPI-->>PracticePage: Progress saved
        end
    end
```

## Course Browsing Flow

```mermaid
flowchart TD
    Start[User visits /courses] --> LoadCourses[Load Courses]
    LoadCourses --> APICall[GET /courses]
    APICall --> DisplayCourses[Display Course List]
    DisplayCourses --> SelectCourse{User selects course}
    SelectCourse --> LoadLessons[Load Lessons]
    LoadLessons --> APICall2[GET /courses/id/lessons]
    APICall2 --> DisplayLessons[Display Lesson Grid]
    DisplayLessons --> UserAction{User action}
    
    UserAction -->|Watch Reference| ShowVideo[Show Reference Video/Image]
    UserAction -->|Start Practice| NavigatePractice[Navigate to /practice]
    UserAction -->|Back| DisplayCourses
    
    ShowVideo --> MediaStorage[Load from media_uploads/]
    NavigatePractice --> PracticePage[Practice Page]
    
    style Start fill:#00D9FF
    style PracticePage fill:#FF6B35
    style MediaStorage fill:#A23B72
```

## Progress Tracking Flow

```mermaid
graph LR
    A[User visits /progress] --> B[Load User Progress]
    B --> C[GET /progress/user/id]
    B --> D[GET /progress/user/id/stats]
    B --> E[GET /progress/user/id/daily-stats]
    B --> F[GET /progress/user/id/practice-consistency]
    B --> G[GET /progress/user/id/top-lessons]
    
    C --> H[Query Progress Table]
    D --> I[Query Stats]
    E --> J[Query Daily Stats]
    F --> K[Query Consistency]
    G --> L[Query Top Lessons]
    
    H --> M[Display Progress Dashboard]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Progress Charts]
    M --> O[Statistics Cards]
    M --> P[Course Completion]
    M --> Q[Practice Analytics]
    
    style A fill:#00D9FF
    style M fill:#FF6B35
    style H fill:#A23B72
```

## Real-Time Detection Pipeline

```mermaid
flowchart LR
    A[Web Camera] --> B[Capture Frame]
    B --> C[Convert to Base64]
    C --> D[POST /yolo/predict]
    D --> E[Decode Image]
    E --> F[YOLO Inference]
    F --> G[Extract Detections]
    G --> H[Return JSON]
    H --> I[Draw Bounding Boxes]
    I --> J[Update Statistics]
    J --> K{Match Target?}
    K -->|Yes| L[Show Congrats]
    K -->|No| B
    L --> M[Save Progress]
    M --> B
    
    style A fill:#00D9FF
    style F fill:#FF6B35
    style L fill:#00FF00
    style M fill:#A23B72
```

## Component Interaction

```mermaid
graph TB
    subgraph "Practice Page Components"
        PracticePage[Practice Page]
        CameraFeed[Camera Feed]
        DetectionStats[Detection Stats]
        CongratsPopup[Congrats Popup]
        Controls[Control Panel]
    end
    
    subgraph "API Layer"
        APIClient[API Client]
        YOLOAPI[YOLO API]
        ProgressAPI[Progress API]
    end
    
    subgraph "Backend Services"
        YOLOService[YOLO Service]
        ProgressService[Progress Service]
    end
    
    PracticePage --> CameraFeed
    PracticePage --> DetectionStats
    PracticePage --> CongratsPopup
    PracticePage --> Controls
    
    CameraFeed --> APIClient
    PracticePage --> APIClient
    
    APIClient --> YOLOAPI
    APIClient --> ProgressAPI
    
    YOLOAPI --> YOLOService
    ProgressAPI --> ProgressService
    
    style PracticePage fill:#FF6B35
    style CameraFeed fill:#00D9FF
    style YOLOService fill:#A23B72
```

## Key Features

### 1. **Real-Time Sign Detection**
- Live camera feed with Web Camera API
- Real-time YOLO model inference
- Visual feedback with bounding boxes
- Accuracy scoring and statistics

### 2. **Progress Tracking**
- Lesson completion tracking
- Course enrollment management
- Practice statistics (attempts, accuracy)
- Practice consistency monitoring
- Top lessons analytics

### 3. **Interactive Learning**
- Reference videos/images for each lesson
- Structured course progression
- Practice sessions with real-time feedback
- Success celebrations on correct detection

### 4. **Analytics & Insights**
- Daily/weekly/monthly statistics
- Practice consistency tracking
- Top lessons practiced
- Progress visualization with charts
- Accuracy trends over time

## Data Flow Summary

1. **Authentication**: User credentials → JWT token → Stored in localStorage
2. **Course Browsing**: API call → Database query → Display courses/lessons
3. **Practice**: Camera frame → YOLO API → Detection results → Progress update
4. **Progress**: Multiple API calls → Database queries → Comprehensive dashboard

## Technology Integration

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: FastAPI, Python
- **ML**: YOLO (Ultralytics), OpenCV
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Storage**: Local filesystem for media


