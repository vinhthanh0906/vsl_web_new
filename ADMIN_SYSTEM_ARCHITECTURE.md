# Admin System Architecture

## Overview
This document describes the system architecture specifically for the **Admin Panel** functionality of the VSL (Vietnamese Sign Language) Learning Platform.

## Architecture Diagram

The system architecture diagram is available in PlantUML format: `ADMIN_SYSTEM_ARCHITECTURE.puml`

## System Components

### 1. Frontend Layer (Next.js/React)

#### Admin Authentication
- **Admin Login Page** (`/admin/login`)
  - Handles admin credential input
  - Calls `/auth/admin/login` endpoint
  - Stores JWT token in localStorage
  
- **Admin Layout** (`/admin/layout.tsx`)
  - Wraps all admin pages
  - Validates admin session on route access
  - Redirects to login if unauthorized
  
- **Session Validator** (`lib/admin-auth.ts`)
  - Validates 24-hour admin session
  - Checks localStorage for admin token
  - Provides logout functionality

#### Admin Pages

1. **Dashboard** (`/admin/dashboard`)
   - System overview and analytics
   - User statistics
   - Course performance metrics
   - Activity charts

2. **Users Management** (`/admin/users`)
   - View all user accounts
   - Search and filter users
   - Display user credentials (hashed passwords)
   - Calls: `GET /admin/users`

3. **Lessons Management** (`/admin/lessons`)
   - View all lessons across courses
   - Filter by course and status
   - Update lesson status (published/draft/archived)
   - Calls: `GET /courses/lessons/all`

4. **Media Manager** (`/admin/media`)
   - Upload media files (images/videos)
   - Associate media with lessons
   - Calls: `POST /courses/media/upload`

5. **Exercises** (`/admin/exercises`)
   - Manage practice exercises
   - Exercise configuration

6. **Activity Monitor** (`/admin/activity`)
   - View user activity logs
   - System usage analytics
   - Real-time activity tracking

#### Admin Components
- **Admin Sidebar**: Navigation menu for admin pages
- **API Client** (`lib/api.ts`): Centralized API calls with admin token injection

### 2. Backend Layer (FastAPI)

#### Authentication & Authorization

**Admin Login Endpoint** (`POST /auth/admin/login`)
- Accepts username and password
- Verifies credentials against `users` table
- Checks `is_admin` flag
- Generates JWT token
- Returns `access_token`

**Admin Auth Middleware** (`get_current_admin`)
- Validates JWT token from Authorization header
- Checks admin privileges via:
  1. `is_admin` flag in database
  2. `ADMIN_USERS` environment variable
  3. `ADMIN_STATIC_TOKEN` environment variable (dev only)
- Protects all admin endpoints

#### Admin API Endpoints

**Users API** (`GET /admin/users`)
- Returns list of all non-admin users
- Includes hashed passwords
- Protected by admin middleware

**Courses API** (`/courses`)
- `GET /courses` - List all courses (public)
- `POST /courses` - Create course (admin)
- `GET /courses/{course_id}` - Get course details
- `POST /courses/{course_id}/lessons` - Create lesson (admin)
- `PATCH /courses/{course_id}/lessons/{lesson_id}` - Update lesson (admin)
- `GET /courses/lessons/all` - Get all lessons

**Media Upload API** (`POST /courses/media/upload`)
- Accepts file uploads (images/videos)
- Stores files in `media_uploads/` directory
- Returns file URL
- Protected by admin middleware

**Monitor API** (`/admin/*`)
- Activity logging endpoints
- User activity tracking
- System monitoring

### 3. Database Layer (PostgreSQL)

#### Core Tables

**users**
- Stores user accounts
- `is_admin` boolean flag identifies admin users
- Primary key: `id`
- Unique: `username`, `email`

**courses**
- Course definitions
- Primary key: `id` (string)
- Contains: name, level, description, lesson_type

**lessons**
- Individual lessons within courses
- Foreign key: `course_id` → `courses.id`
- Contains: lesson_id, name, video_url, order

**activity_logs**
- User activity tracking
- Foreign key: `user_id` → `users.id` (nullable)
- Tracks: event_type, detail, created_at

**user_course_enrollments**
- Many-to-many: Users ↔ Courses
- Tracks enrollment and completion status

**user_lesson_progress**
- Detailed lesson progress tracking
- Links: User, Lesson, Course
- Tracks: attempts, accuracy, completion

### 4. File Storage

**Media Storage** (`media_uploads/`)
- Stores uploaded images and videos
- Files referenced by lessons via `video_url`
- Served statically by FastAPI

## Authentication Flow

```
1. Admin enters credentials → Login Page
2. POST /auth/admin/login
3. Backend verifies credentials & is_admin flag
4. Backend generates JWT token
5. Frontend stores token in localStorage
6. All subsequent requests include: Authorization: Bearer <token>
7. Admin middleware validates token on each request
8. Session valid for 24 hours
```

## Authorization Flow

```
1. Admin makes API request with Bearer token
2. Admin Auth Middleware extracts token
3. Validates JWT signature
4. Checks admin privileges:
   - Query users table for is_admin flag
   - OR check ADMIN_USERS env var
   - OR check ADMIN_STATIC_TOKEN (dev)
5. If authorized → Process request
6. If unauthorized → Return 403 Forbidden
```

## Data Flow Examples

### View Users
```
Admin Users Page
  → APIClient.adminGetUsers()
  → GET /admin/users (with Bearer token)
  → Admin Auth Middleware validates
  → Users API queries users table
  → Returns user list
  → Frontend displays in table
```

### Upload Media
```
Admin Media Page
  → User selects file
  → APIClient.uploadMediaFile(file)
  → POST /courses/media/upload (with Bearer token)
  → Admin Auth Middleware validates
  → Media API saves file to media_uploads/
  → Returns file URL
  → Frontend updates lesson with video_url
```

### Manage Lessons
```
Admin Lessons Page
  → APIClient.getAllLessons()
  → GET /courses/lessons/all
  → Courses API queries lessons table
  → Returns all lessons with course info
  → Frontend displays with filters
```

## Security Features

1. **JWT Token Authentication**
   - Secure token-based authentication
   - Token expiration handling
   - Stored in localStorage (client-side)

2. **Admin Privilege Verification**
   - Multiple verification methods
   - Database flag check
   - Environment variable support
   - Static token for development

3. **Route Protection**
   - Frontend route guards
   - Backend endpoint protection
   - Automatic redirect on unauthorized access

4. **Session Management**
   - 24-hour session validity
   - Automatic logout on expiration
   - Token refresh capability

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ADMIN_STATIC_TOKEN=dev-token (optional, dev only)
ADMIN_USERS=admin@example.com,superuser (optional)
DB_URL=postgresql://user:pass@host/db
```

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/admin/login` | POST | None | Admin login |
| `/admin/users` | GET | Admin | List all users |
| `/courses` | GET | None | List courses |
| `/courses` | POST | Admin | Create course |
| `/courses/{id}/lessons` | POST | Admin | Create lesson |
| `/courses/{id}/lessons/{lid}` | PATCH | Admin | Update lesson |
| `/courses/lessons/all` | GET | None | Get all lessons |
| `/courses/media/upload` | POST | Admin | Upload media file |

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem (`media_uploads/`)

## Future Enhancements

1. Role-based access control (RBAC)
2. Admin activity logging
3. Bulk operations (import/export)
4. Advanced analytics dashboard
5. Real-time notifications
6. Audit trail for admin actions




