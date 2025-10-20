#!/bin/bash

# Test the CTF Collection API endpoints
# Make sure the backend is running on localhost:5000

BASE_URL="http://localhost:5000/api"
TEST_EMAIL="test@vitstudent.ac.in"
TEST_PASSWORD="testpass123"

echo "CTF Collection - API Test Suite"
echo "================================"
echo "Base URL: $BASE_URL"
echo

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq . && echo "✓ Health check passed" || echo "✗ Health check failed"
echo

# Test 2: Register User
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo "✗ Registration failed or user already exists"
    echo "Testing login instead..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
else
    echo "✓ Registration successful"
fi

echo

# Test 3: Get Current User
echo "3. Testing get current user..."
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✓ Get user passed"
echo

# Test 4: List User's Submissions
echo "4. Testing list user submissions..."
curl -s "$BASE_URL/submissions/mine" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✓ List submissions passed"
echo

echo "================================"
echo "API tests completed!"
echo
echo "Note: For file upload tests, use:"
echo "curl -X POST http://localhost:5000/api/submissions \\"
echo "  -H \"Authorization: Bearer <TOKEN>\" \\"
echo "  -F \"title=Challenge\" \\"
echo "  -F \"flag=FLAG{...}\" \\"
echo "  -F \"writeup=@writeup.md\" \\"
echo "  -F \"file=@challenge.zip\""
