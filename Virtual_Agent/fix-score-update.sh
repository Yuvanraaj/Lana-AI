#!/bin/bash
# Score Update Fix Script
# Fixes issues with interview scores not being updated in the database

echo "🔧 Virtual Agent Score Update - Troubleshooting & Fix"
echo "======================================================\n"

# Check 1: Verify backend is running
echo "1️⃣ Starting fresh servers..."
taskkill /F /IM node.exe 2>/dev/null || true
sleep 2

echo "   Starting backend..."
cd backend
node server.js &
BACKEND_PID=$!
sleep 3

echo "   Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 3

# Check 2: Test the API
echo "\n2️⃣ Testing API Connectivity..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health)
if [ "$HEALTH" = "200" ]; then
  echo "   ✅ Backend is responding"
else
  echo "   ❌ Backend not responding (HTTP $HEALTH)"
fi

ROLES=$(curl -s http://localhost:8001/api/interview/roles)
if echo "$ROLES" | grep -q "roles"; then
  echo "   ✅ Interview roles API working"
else
  echo "   ❌ Interview roles API error"
fi

# Check 3: Database status
echo "\n3️⃣ Checking Database..."
if [ -f "backend/data/interview_platform.db" ]; then
  echo "   ✅ Database file exists"
else
  echo "   ⚠️  Database file not found - will be created on first use"
fi

# Check 4: Instructions
echo "\n4️⃣ Next Steps:"
echo "   1. Visit http://localhost:5173/ in your browser"
echo "   2. Login or Register with your credentials"
echo "   3. Take a new Virtual Interview"
echo "   4. Complete all 5 questions"
echo "   5. Click 'Complete Interview' button"
echo "   6. Check your profile for the updated score"
echo "\n   Troubleshooting tips:"
echo "   - If score still shows 0: Check backend console for errors"
echo "   - Ensure you're fully completing all questions"
echo "   - Try a fresh login if you see cached data"
echo "   - Check console (F12) for any error messages"

# Save PIDs for later cleanup
echo "$BACKEND_PID" > /tmp/backend.pid
echo "$FRONTEND_PID" > /tmp/frontend.pid

echo "\n✅ Servers started. Press Ctrl+C to stop."
wait
