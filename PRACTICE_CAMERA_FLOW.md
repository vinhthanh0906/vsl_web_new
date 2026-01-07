# Practice with Camera Flow

## Overview
This document describes the complete flow of the practice session with real-time camera-based sign language detection using YOLO model.

## Sequence Diagram

The complete sequence diagram is available in PlantUML format: `PRACTICE_CAMERA_SEQUENCE.puml`

## Flow Summary

### 1. **Page Initialization**
```
User navigates to /practice?section=alphabet&lesson=a
  ↓
Practice Page loads
  ↓
Extracts section and lesson from URL parameters
  ↓
Auto-starts camera (sets isActive = true)
  ↓
Logs "enter_lesson" event to activity_logs
```

### 2. **Camera Initialization**
```
Camera Feed Component mounts
  ↓
Requests camera access via MediaDevices API
  ↓
User grants permission
  ↓
Video stream starts
  ↓
Starts detection loop
```

### 3. **Real-Time Detection Loop**

The detection loop runs continuously using `requestAnimationFrame`:

```
Capture Frame
  ↓
Convert to Base64
  ↓
Send to YOLO API
  ↓
YOLO Model Inference
  ↓
Receive Detections
  ↓
Draw Bounding Boxes
  ↓
Check for Match
  ↓
Update UI
  ↓
Loop continues...
```

### 4. **Frame Processing Pipeline**

#### Step 4.1: Frame Capture
```javascript
// Create hidden canvas
const captureCanvas = document.createElement("canvas")
captureCanvas.width = video.videoWidth
captureCanvas.height = video.videoHeight

// Draw video frame to canvas
captureCtx.drawImage(video, 0, 0, width, height)

// Convert to base64 JPEG
const frame = captureCanvas.toDataURL("image/jpeg")
// Result: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

#### Step 4.2: API Request
```javascript
POST http://127.0.0.1:8000/yolo/predict
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### Step 4.3: Backend Processing
```python
# Extract base64 data
img_base64 = data.get("image")
img_bytes = base64.b64decode(img_base64.split(",")[1])

# Convert to OpenCV image
nparr = np.frombuffer(img_bytes, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# Run YOLO inference
results = model(img, verbose=False)
boxes = results[0].boxes

# Extract detections
detections = []
for box in boxes:
    detections.append({
        "class": model.names[int(box.cls)],  # e.g., "a"
        "confidence": float(box.conf),        # e.g., 0.95
        "bbox": [x1, y1, x2, y2]             # Bounding box coordinates
    })
```

#### Step 4.4: Response
```json
{
  "detections": [
    {
      "class": "a",
      "confidence": 0.95,
      "bbox": [100, 150, 200, 250]
    }
  ]
}
```

### 5. **Visual Feedback**

#### Bounding Box Drawing
```javascript
// For each detection
detections.forEach((detection) => {
  const [x1, y1, x2, y2] = detection.bbox
  const isMatch = detection.class.toLowerCase() === targetLesson.toLowerCase()
  
  // Draw bounding box
  ctx.strokeStyle = isMatch ? "#00FF00" : "#FF6B35"  // Green if match, Orange otherwise
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
  
  // Draw label
  ctx.fillText(`${detection.class} ${(confidence * 100).toFixed(1)}%`, x1 + 5, y1 + 5)
})
```

### 6. **Match Detection**

```javascript
// Check if any detection matches target lesson
const matchedDetection = detections.find(
  (detection) => detection.class.toLowerCase() === lesson?.toLowerCase()
)

if (matchedDetection && !cooldownRef.current) {
  // Match found!
  // Show congrats popup
  // Save progress
  // Increment match count
}
```

### 7. **Progress Saving**

When a match is detected:

#### Step 7.1: Local Storage
```javascript
markLessonComplete(section, lesson)
// Saves to localStorage for offline tracking
```

#### Step 7.2: Database Update
```javascript
POST /progress/lesson/complete
{
  "user_id": 1,
  "course_id": "alphabet",
  "lesson_id": "a",
  "accuracy": 95
}
```

**Backend Processing:**
```python
# Get or create progress record
progress = db.query(UserLessonProgress).filter(
    UserLessonProgress.user_id == user_id,
    UserLessonProgress.lesson_id == lesson.id
).first()

# Update progress
progress.total_attempts += 1
progress.successful_detections += 1
progress.best_accuracy = max(progress.best_accuracy, accuracy)
progress.completed = True
progress.last_practiced_at = datetime.utcnow()

db.commit()
```

## Key Components

### Practice Page (`app/practice/page.tsx`)
- Manages overall practice session state
- Handles match detection logic
- Saves progress to database
- Displays UI components

### Camera Feed Component (`components/camera-feed.tsx`)
- Manages camera access
- Captures frames from video stream
- Sends frames to YOLO API
- Draws bounding boxes on canvas
- Updates detection statistics

### YOLO API (`backend/yolo/routes.py`)
- Receives base64-encoded images
- Decodes and processes images
- Runs YOLO model inference
- Returns detection results

### Progress API (`backend/progress/routes.py`)
- Handles lesson completion
- Updates user progress records
- Tracks attempts and accuracy

## Detection Loop Details

### Frame Rate
- Uses `requestAnimationFrame` for smooth animation
- Typically runs at 30-60 FPS (browser-dependent)
- Each frame is sent to YOLO API for detection

### Cooldown Mechanism
- Prevents multiple detections from same frame
- Cooldown period: 3 seconds
- Ensures only one "match" event per successful detection

### Error Handling
- Camera permission denied → Shows error message
- YOLO API failure → Logs error, continues loop
- Network errors → Graceful degradation

## User Interactions

### Start/Stop Detection
```
User clicks "Start Detection" button
  ↓
isActive = true
  ↓
Camera initializes
  ↓
Detection loop starts
```

### Reset Counter
```
User clicks "Reset Counter" button
  ↓
matchCount = 0
  ↓
detectionStatus = null
  ↓
cooldownRef = false
```

## Performance Considerations

1. **Frame Processing**
   - Base64 encoding adds ~33% overhead
   - JPEG compression reduces payload size
   - Async processing prevents UI blocking

2. **Network Optimization**
   - Each frame sent as separate request
   - No batching (real-time requirement)
   - Response time critical for smooth experience

3. **YOLO Model**
   - Model loaded once at server startup
   - Inference time: ~50-200ms per frame
   - GPU acceleration improves performance

4. **Database Updates**
   - Progress saved only on match detection
   - Not saved for every frame (performance)
   - Async save (doesn't block UI)

## Data Flow

```
Camera Stream
  ↓
Frame Capture (Canvas)
  ↓
Base64 Encoding
  ↓
HTTP POST to YOLO API
  ↓
YOLO Model Inference
  ↓
Detection Results (JSON)
  ↓
Bounding Box Drawing
  ↓
Match Detection Logic
  ↓
Progress Update (if match)
  ↓
UI Update
```

## Success Flow Example

```
1. User shows sign "a" to camera
2. Frame captured: video frame → canvas → base64
3. POST /yolo/predict with image
4. YOLO detects: class="a", confidence=0.95
5. Response: {"detections": [{"class": "a", "confidence": 0.95, ...}]}
6. Frontend draws green bounding box (match detected)
7. Congrats popup appears
8. Match count increments
9. Progress saved to database:
   - total_attempts += 1
   - successful_detections += 1
   - best_accuracy = 95
   - completed = true
10. Cooldown activated (3 seconds)
11. Loop continues...
```

## Error Scenarios

### Camera Permission Denied
```
Browser → CameraFeed: Permission denied
CameraFeed → PracticePage: Error state
PracticePage → User: "Unable to access camera. Please check permissions."
```

### YOLO API Failure
```
CameraFeed → YOLOAPI: POST request
YOLOAPI → CameraFeed: Network error / 500 error
CameraFeed → Console: Log error
CameraFeed → PracticePage: Continue loop (graceful degradation)
```

### Database Save Failure
```
PracticePage → ProgressAPI: POST /progress/lesson/complete
ProgressAPI → PracticePage: Error response
PracticePage → Console: Log error
PracticePage → User: Progress saved locally only
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/yolo/predict` | POST | Real-time sign detection |
| `/progress/lesson/complete` | POST | Save lesson completion |
| `/auth/log` | POST | Log user activity |

## Technologies

- **Frontend**: React, Next.js, Canvas API, MediaDevices API
- **Backend**: FastAPI, Python
- **ML Model**: YOLO (Ultralytics)
- **Computer Vision**: OpenCV
- **Database**: PostgreSQL




