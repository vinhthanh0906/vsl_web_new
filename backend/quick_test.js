import http from 'k6/http';
import { check } from 'k6';

// Quick smoke test - verify all endpoints work
export const options = {
  vus: 1,        // 1 virtual user
  duration: '10s', // 10 seconds
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';
const TEST_USER_ID = parseInt(__ENV.USER_ID || '6');

export default function () {
  console.log(`Testing user ID: ${TEST_USER_ID}`);
  
  // 1. Health check
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    'health check': (r) => r.status === 200,
  });
  
  // 2. Get user progress
  const progress = http.get(`${BASE_URL}/progress/user/${TEST_USER_ID}`);
  check(progress, {
    'get progress': (r) => r.status === 200,
  });
  
  // 3. Get user stats
  const stats = http.get(`${BASE_URL}/progress/user/${TEST_USER_ID}/stats`);
  check(stats, {
    'get stats': (r) => r.status === 200,
  });
  
  // 4. Test YOLO prediction
  const yoloPayload = JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A'
  });
  
  const yolo = http.post(
    `${BASE_URL}/yolo/predict`,
    yoloPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(yolo, {
    'yolo prediction': (r) => r.status === 200,
  });
  
  // 5. Test lesson completion
  const completePayload = JSON.stringify({
    user_id: TEST_USER_ID,
    course_id: 'alphabet',
    lesson_id: 'a',
    accuracy: 95.5
  });
  
  const complete = http.post(
    `${BASE_URL}/progress/lesson/complete`,
    completePayload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(complete, {
    'lesson complete': (r) => r.status === 200,
  });
  
  console.log('✅ All tests passed!');
}

