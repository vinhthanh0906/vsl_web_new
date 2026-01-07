# Project Tools and Techniques

## Programming Languages
- **Python 3.x** - Backend development
- **TypeScript** - Frontend type-safe development
- **JavaScript** - Frontend scripting
- **SQL** - Database queries

## Frontend Technologies

### Core Framework & Runtime
- **Next.js 15.2.4** - React framework with SSR/SSG
- **React 18.3.1** - UI library
- **React DOM 18.3.1** - DOM rendering

### UI Component Libraries
- **Radix UI** - Headless UI components:
  - `@radix-ui/react-accordion`
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-aspect-ratio`
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-collapsible`
  - `@radix-ui/react-context-menu`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-hover-card`
  - `@radix-ui/react-label`
  - `@radix-ui/react-menubar`
  - `@radix-ui/react-navigation-menu`
  - `@radix-ui/react-popover`
  - `@radix-ui/react-progress`
  - `@radix-ui/react-radio-group`
  - `@radix-ui/react-scroll-area`
  - `@radix-ui/react-select`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-slider`
  - `@radix-ui/react-slot`
  - `@radix-ui/react-switch`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-toast`
  - `@radix-ui/react-toggle`
  - `@radix-ui/react-toggle-group`
  - `@radix-ui/react-tooltip`

### Styling & CSS
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **PostCSS 8.5** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **tailwindcss-animate 1.0.7** - Animation utilities
- **class-variance-authority 0.7.1** - Component variant management
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 2.5.5** - Merge Tailwind classes

### Form Handling & Validation
- **React Hook Form 7.60.0** - Form state management
- **@hookform/resolvers 3.10.0** - Form validation resolvers
- **Zod 3.25.76** - Schema validation

### Data Visualization
- **Recharts (latest)** - Chart library for React:
  - LineChart
  - BarChart
  - AreaChart
  - PieChart
  - ResponsiveContainer

### Media & Camera
- **react-webcam 7.2.0** - Web camera access
- **Browser MediaDevices API** - Native browser camera API

### Date & Time
- **date-fns 4.1.0** - Date utility library
- **react-day-picker 9.8.0** - Date picker component

### State Management & Utilities
- **next-themes 0.4.6** - Theme management (dark/light mode)
- **localStorage API** - Client-side storage
- **React Hooks** - useState, useEffect, useRef, useContext

### UI Enhancements
- **Lucide React 0.454.0** - Icon library
- **Sonner 1.7.4** - Toast notifications
- **cmdk 1.0.4** - Command menu component
- **vaul 0.9.9** - Drawer component
- **embla-carousel-react 8.5.1** - Carousel component
- **react-resizable-panels 2.1.7** - Resizable panel layouts
- **input-otp 1.4.1** - OTP input component

### Analytics
- **@vercel/analytics (latest)** - Web analytics

### Development Tools
- **TypeScript 5** - Type checking
- **ESLint** - Code linting
- **@types/node 22** - Node.js type definitions
- **@types/react 19** - React type definitions
- **@types/react-dom 19** - React DOM type definitions

## Backend Technologies

### Web Framework
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server

### Database & ORM
- **PostgreSQL** - Relational database
- **SQLAlchemy** - Python ORM:
  - `sqlalchemy.ext.declarative` - Declarative base
  - `sqlalchemy.orm` - ORM session management
  - `sqlalchemy` - Core SQL functionality

### Authentication & Security
- **python-jose[cryptography]** - JWT token handling
- **passlib[argon2]** - Password hashing with Argon2
- **HTTPBearer** - Bearer token authentication
- **CORS Middleware** - Cross-origin resource sharing

### Machine Learning & Computer Vision
- **Ultralytics YOLO** - Object detection model:
  - `fullalphabet_yolo_v11s.pt` - Full alphabet detection model
  - `v9_l_yolo11.pt` - YOLO v9 large model
  - `v9_n_yolo11.pt` - YOLO v9 nano model
- **OpenCV (cv2)** - Computer vision library
- **NumPy** - Numerical computing

### Data Validation
- **Pydantic[email]** - Data validation and settings management

### Environment & Configuration
- **python-dotenv** - Environment variable management

### Real-time Communication
- **WebSocket** - Real-time bidirectional communication
- **FastAPI WebSocket** - WebSocket support

### File Handling
- **Base64** - Image encoding/decoding
- **FastAPI StaticFiles** - Static file serving

## Development Tools & Techniques

### Version Control
- **Git** - Version control system

### Package Management
- **npm** - Node.js package manager
- **pnpm** - Fast, disk space efficient package manager
- **pip** - Python package manager
- **Conda** - Python environment management

### Build Tools
- **Next.js Build System** - Production builds
- **TypeScript Compiler** - Type checking and compilation
- **PostCSS** - CSS processing pipeline

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **TypeScript Strict Mode** - Type safety enforcement

### Documentation
- **Markdown** - Documentation format
- **PlantUML** - UML diagram generation
- **Mermaid** - Diagram and flowchart generation

## Architecture Patterns & Techniques

### Frontend Patterns
- **Component-Based Architecture** - React components
- **Server-Side Rendering (SSR)** - Next.js SSR
- **Static Site Generation (SSG)** - Next.js SSG
- **Client-Side Rendering (CSR)** - React hydration
- **Custom Hooks** - Reusable logic
- **Context API** - State management
- **Route Protection** - Authentication guards
- **API Client Pattern** - Centralized API calls

### Backend Patterns
- **RESTful API** - REST architecture
- **Dependency Injection** - FastAPI Depends
- **Middleware Pattern** - CORS, authentication
- **Router Pattern** - Modular route organization
- **Service Layer Pattern** - Business logic separation
- **Repository Pattern** - Data access abstraction
- **Session Management** - Database sessions

### Database Patterns
- **ORM Mapping** - SQLAlchemy ORM
- **Migration Strategy** - Table creation/updates
- **Foreign Key Relationships** - Database relationships
- **Indexing** - Query optimization

### Security Techniques
- **JWT Authentication** - Token-based auth
- **Password Hashing** - Argon2 algorithm
- **Bearer Token Authorization** - API security
- **CORS Configuration** - Cross-origin security
- **Environment Variables** - Secret management
- **Input Validation** - Pydantic schemas

### Real-time Techniques
- **WebSocket Connections** - Real-time updates
- **Polling** - Periodic data fetching
- **Event-Driven Architecture** - Activity logging

### Data Processing Techniques
- **Base64 Encoding/Decoding** - Image transmission
- **Image Processing** - OpenCV operations
- **Model Inference** - YOLO predictions
- **Bounding Box Detection** - Object localization
- **Confidence Scoring** - Detection accuracy

### Performance Optimization
- **Lazy Loading** - Component code splitting
- **Image Optimization** - Next.js image optimization
- **Database Query Optimization** - Efficient queries
- **Caching** - localStorage caching
- **Connection Pooling** - Database connections

## Testing & Monitoring

### Load Testing
- **k6** (JavaScript load testing) - Performance testing
- **Custom load test scripts** - `load_test.js`

### Monitoring
- **Activity Logging** - User activity tracking
- **Progress Tracking** - Learning progress monitoring
- **Analytics** - User behavior analysis

## Deployment & Infrastructure

### Server
- **Uvicorn** - ASGI server for FastAPI
- **Node.js** - Runtime for Next.js

### File Storage
- **Local File System** - Media file storage (`media_uploads/`)
- **Static File Serving** - FastAPI StaticFiles

### Environment Management
- **Environment Variables** - Configuration via `.env`
- **Conda Environments** - Python environment isolation

## Data Formats & Protocols

### Data Formats
- **JSON** - API communication
- **Base64** - Image encoding
- **JWT** - Token format
- **SQL** - Database queries

### Protocols
- **HTTP/HTTPS** - Web protocols
- **WebSocket** - Real-time protocol
- **REST** - API architecture

## Model Files

### YOLO Models
- `fullalphabet_yolo_v11s.pt` - Primary sign language detection model
- `v9_l_yolo11.pt` - YOLO v9 large variant
- `v9_n_yolo11.pt` - YOLO v9 nano variant

## Development Workflow

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting
- `uvicorn main:app --reload` - Backend development server

### Database Management
- **SQLAlchemy create_all()** - Table creation
- **Manual migrations** - Schema updates

## Design Patterns

### Frontend
- **Container/Presentational Components**
- **Higher-Order Components (HOCs)**
- **Render Props**
- **Custom Hooks Pattern**
- **Compound Components**

### Backend
- **Dependency Injection**
- **Factory Pattern** (Session creation)
- **Singleton Pattern** (Model loading)
- **Strategy Pattern** (Authentication methods)

## API Design

### REST Endpoints
- **GET** - Data retrieval
- **POST** - Data creation
- **PUT/PATCH** - Data updates
- **DELETE** - Data deletion

### WebSocket Endpoints
- Real-time activity monitoring
- User presence tracking

## Data Flow Techniques

### Frontend to Backend
- **Fetch API** - HTTP requests
- **JSON Payloads** - Data transmission
- **Base64 Images** - Image transmission
- **Bearer Tokens** - Authentication headers

### Backend Processing
- **Request Validation** - Pydantic models
- **Database Queries** - SQLAlchemy ORM
- **Model Inference** - YOLO predictions
- **Response Serialization** - JSON responses

### Real-time Updates
- **WebSocket Broadcasting** - Real-time notifications
- **Polling** - Periodic data refresh
- **Event Logging** - Activity tracking

## UI/UX Techniques

### Responsive Design
- **Mobile-First Approach**
- **Tailwind Responsive Utilities**
- **Flexbox/Grid Layouts**

### User Experience
- **Loading States** - User feedback
- **Error Handling** - Error messages
- **Toast Notifications** - User alerts
- **Progress Indicators** - Visual feedback
- **Congratulation Popups** - Positive reinforcement

### Accessibility
- **Radix UI** - Accessible components
- **ARIA Labels** - Screen reader support
- **Keyboard Navigation** - Keyboard accessibility

## Code Organization

### Frontend Structure
- **App Router** - Next.js 13+ routing
- **Component Library** - Reusable UI components
- **Custom Hooks** - Shared logic
- **API Client** - Centralized API calls
- **Type Definitions** - TypeScript interfaces

### Backend Structure
- **Modular Routes** - Feature-based organization
- **Service Layer** - Business logic
- **Database Models** - Data models
- **Schemas** - Data validation
- **Utilities** - Helper functions



