#!/bin/bash

# Simple test script for Job Metrics API
# Make sure the server is running first: npm run dev

echo "Testing Job Metrics API"
echo "======================="
echo ""

# Test 1: Store metrics
echo "📤 Storing metrics..."
curl -X POST http://localhost:8080/api/metrics \
  -H "Content-Type: application/json" \
  -d @src/data/sample.json \
  -w "\n\n" \
  -s | jq '.'

echo ""
echo "📥 Getting metrics by job_uuid..."
curl -s http://localhost:8080/api/metrics/4c3ab6d1-ed7e-427f-a876-63022b6417c8 | jq '.'

echo ""
echo "📋 Getting all metrics (paginated)..."
curl -s "http://localhost:8080/api/metrics?page=1&limit=5" | jq '.'
