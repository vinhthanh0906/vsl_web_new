#!/bin/bash

# K6 Load Test Runner Script
# Usage: ./run_load_test.sh [quick|full|custom]

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
USER_ID="${USER_ID:-6}"

echo "🚀 K6 Load Test Runner"
echo "======================"
echo "Base URL: $BASE_URL"
echo "User ID: $USER_ID"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ K6 is not installed!"
    echo "Install it with: brew install k6 (macOS) or visit https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if backend is running
echo "🔍 Checking if backend is accessible..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "❌ Backend is not accessible at $BASE_URL"
    echo "Please start the backend server first:"
    echo "  cd backend && conda activate vsl_web && uvicorn main:app --reload"
    exit 1
fi
echo "✅ Backend is accessible"
echo ""

# Run appropriate test
case "${1:-quick}" in
    quick)
        echo "🏃 Running quick smoke test (10 seconds, 1 user)..."
        k6 run --env BASE_URL="$BASE_URL" --env USER_ID="$USER_ID" quick_test.js
        ;;
    full)
        echo "🔥 Running full load test (3 minutes, up to 30 users)..."
        k6 run --env BASE_URL="$BASE_URL" --env USER_ID="$USER_ID" load_test.js
        ;;
    custom)
        echo "⚙️  Running custom test..."
        echo "Usage: BASE_URL=$BASE_URL USER_ID=$USER_ID k6 run load_test.js"
        k6 run --env BASE_URL="$BASE_URL" --env USER_ID="$USER_ID" load_test.js
        ;;
    *)
        echo "Usage: $0 [quick|full|custom]"
        echo ""
        echo "  quick  - Quick smoke test (10s, 1 user)"
        echo "  full   - Full load test (3m, up to 30 users)"
        echo "  custom - Custom test with environment variables"
        exit 1
        ;;
esac

echo ""
echo "✅ Test completed!"

