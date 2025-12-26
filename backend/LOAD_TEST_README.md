# K6 Load Testing Guide

## Overview
This load test simulates users practicing lessons with camera detection. It tests:
- Progress page loading
- User statistics retrieval
- YOLO prediction (camera detection)
- Lesson completion tracking
- Progress updates

## Prerequisites

### Install K6
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D53
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows (using Chocolatey)
choco install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

## Running the Load Test

### Basic Test
```bash
cd backend
k6 run load_test.js
```

### Custom Configuration
```bash
# Test with different user ID
k6 run load_test.js --env USER_ID=6

# Test against different server
k6 run load_test.js --env BASE_URL=http://localhost:8000

# Test with custom credentials
k6 run load_test.js --env USER_ID=6 --env EMAIL=test@example.com
```

### Quick Smoke Test (10 seconds)
```bash
k6 run --vus 5 --duration 10s load_test.js
```

### High Load Test (100 users)
```bash
k6 run --vus 100 --duration 5m load_test.js
```

## Test Scenarios

### Scenario 1: Camera Practice Flow
Simulates a complete user session:
1. User opens progress page
2. User checks statistics
3. User practices with camera (YOLO detection)
4. User successfully completes a lesson
5. User refreshes progress to see updates

### Load Pattern
- **Ramp up**: 0 → 10 users (30s)
- **Sustain**: 20 users (1m)
- **Peak**: 30 users (1m)
- **Ramp down**: 30 → 0 users (30s)

## Expected Results

### Success Criteria
- ✅ 95% of requests complete in < 2 seconds
- ✅ Error rate < 10%
- ✅ YOLO predictions complete in < 3 seconds
- ✅ All endpoints return 200 status codes

### Sample Output
```
     ✓ progress page loaded
     ✓ progress response time < 500ms
     ✓ stats loaded
     ✓ YOLO prediction successful
     ✓ YOLO response time < 3000ms
     ✓ lesson completion saved
     ✓ completion response time < 1000ms

     checks.........................: 100.00% ✓ 1500  ✗ 0
     data_received..................: 2.5 MB  42 kB/s
     data_sent......................: 1.2 MB  20 kB/s
     http_req_duration..............: avg=450ms min=120ms med=380ms max=2800ms p(95)=1200ms
     http_req_failed................: 0.00%   ✓ 0     ✗ 0
     http_reqs......................: 300     5.0/s
     iteration_duration.............: avg=5.2s min=4.1s med=5.0s max=8.5s p(95)=6.8s
     iterations.....................: 60      1.0/s
     vus............................: 1       min=1  max=30
     vus_max........................: 30      min=30 max=30
```

## Troubleshooting

### API Not Accessible
```bash
# Check if backend is running
curl http://127.0.0.1:8000/health

# If not, start backend:
cd backend
conda activate vsl_web
uvicorn main:app --reload
```

### High Error Rate
- Check backend logs for errors
- Verify database connection
- Check if YOLO model is loaded
- Verify user ID exists in database

### Slow Response Times
- Check database query performance
- Monitor YOLO prediction time
- Check server CPU/memory usage
- Consider database indexing

## Customizing the Test

### Modify Load Pattern
Edit `load_test.js`:
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};
```

### Test Different Endpoints
Add more test scenarios:
```javascript
// Test course listing
const coursesRes = http.get(`${API_URL}/courses`);
check(coursesRes, {
  'courses loaded': (r) => r.status === 200,
});
```

### Test with Authentication
```javascript
// Login first
const loginRes = http.post(`${API_URL}/auth/login`, JSON.stringify({
  email: TEST_EMAIL,
  password: TEST_PASSWORD
}));

const token = JSON.parse(loginRes.body).access_token;

// Use token in subsequent requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

## Performance Benchmarks

### Expected Performance (Single User)
- Progress page: < 200ms
- User stats: < 200ms
- YOLO prediction: < 2000ms
- Lesson completion: < 500ms

### Expected Performance (30 Concurrent Users)
- Progress page: < 500ms (p95)
- User stats: < 500ms (p95)
- YOLO prediction: < 3000ms (p95)
- Lesson completion: < 1000ms (p95)

## Monitoring During Test

### Watch Backend Logs
```bash
# In another terminal
tail -f backend_logs.txt
```

### Monitor Database
```bash
# Check active connections
psql -U your_user -d your_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql -U your_user -d your_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public';"
```

## Next Steps

1. **Baseline Test**: Run with 1 user to establish baseline
2. **Load Test**: Run with 30 users to test under load
3. **Stress Test**: Run with 100+ users to find breaking point
4. **Spike Test**: Test sudden traffic spikes
5. **Endurance Test**: Test for extended periods (30+ minutes)

## Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://github.com/grafana/k6/tree/master/examples)
- [Performance Testing Best Practices](https://k6.io/docs/test-types/)

