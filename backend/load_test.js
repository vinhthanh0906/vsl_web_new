import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 30 },  // Ramp up to 30 users
    { duration: '1m', target: 30 },   // Stay at 30 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],      // Error rate should be less than 10%
    errors: ['rate<0.1'],
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}`;

// Test user credentials (you may need to adjust these)
const TEST_USER_ID = parseInt(__ENV.USER_ID || '6');
const TEST_EMAIL = __ENV.EMAIL || 'hung@gmail.com';
const TEST_PASSWORD = __ENV.PASSWORD || '123456';

// Sample base64 image (small test image)
const SAMPLE_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';

export default function () {
  // Test scenario: User opens lesson and practices with camera
  
  // 1. Get user progress (simulates loading progress page)
  const progressRes = http.get(`${API_URL}/progress/user/${TEST_USER_ID}`);
  check(progressRes, {
    'progress page loaded': (r) => r.status === 200,
    'progress response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);

  // 2. Get user stats (simulates loading dashboard stats)
  const statsRes = http.get(`${API_URL}/progress/user/${TEST_USER_ID}/stats`);
  check(statsRes, {
    'stats loaded': (r) => r.status === 200,
    'stats response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);

  // 3. Simulate YOLO prediction (camera detection)
  // This is the main camera functionality - sending frames for detection
  const yoloPayload = JSON.stringify({
    image: SAMPLE_IMAGE_BASE64
  });
  
  const yoloRes = http.post(
    `${API_URL}/yolo/predict`,
    yoloPayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(yoloRes, {
    'YOLO prediction successful': (r) => r.status === 200,
    'YOLO response time < 3000ms': (r) => r.timings.duration < 3000,
    'YOLO returns detections': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('detections');
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  
  sleep(0.5); // Simulate frame processing time

  // 4. Simulate successful lesson completion (when detection matches)
  // Randomly complete a lesson (simulating successful detection)
  const lessons = ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y'];
  const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
  const randomAccuracy = 85 + Math.random() * 15; // Random accuracy between 85-100
  
  const completePayload = JSON.stringify({
    user_id: TEST_USER_ID,
    course_id: 'alphabet',
    lesson_id: randomLesson,
    accuracy: randomAccuracy
  });
  
  const completeRes = http.post(
    `${API_URL}/progress/lesson/complete`,
    completePayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(completeRes, {
    'lesson completion saved': (r) => r.status === 200,
    'completion response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  
  sleep(2); // Simulate user viewing results

  // 5. Refresh progress (simulates user checking updated progress)
  const refreshProgressRes = http.get(`${API_URL}/progress/user/${TEST_USER_ID}`);
  check(refreshProgressRes, {
    'progress refresh successful': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
}

// Setup function - runs once before the test
export function setup() {
  console.log('🚀 Starting load test for camera/lesson practice flow');
  console.log(`📍 Testing against: ${API_URL}`);
  console.log(`👤 Using test user ID: ${TEST_USER_ID}`);
  
  // Verify API is accessible
  const healthCheck = http.get(`${API_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`API health check failed: ${healthCheck.status}`);
  }
  
  console.log('✅ API is accessible, starting load test...');
  return { apiUrl: API_URL };
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log('🏁 Load test completed');
}

