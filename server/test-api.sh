#!/bin/bash

# Test script for Job Metrics API

API_URL="http://localhost:8080/api/metrics"

echo "======================================"
echo "Testing Job Metrics API"
echo "======================================"
echo ""

# Test 1: POST metrics
echo "1. Storing job metrics..."
RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d @src/data/sample.json)

echo "$RESPONSE" | jq '.'
echo ""

# Extract job_uuid from sample.json
JOB_UUID=$(jq -r '.job_uuid' src/data/sample.json)

# Test 2: GET metrics by job_uuid
echo "2. Retrieving metrics for job_uuid: $JOB_UUID"
curl -s "$API_URL/$JOB_UUID" | jq '.'
echo ""

# Test 3: GET all metrics (paginated)
echo "3. Retrieving all metrics (page 1, limit 5)"
curl -s "$API_URL?page=1&limit=5" | jq '.'
echo ""

echo "======================================"
echo "Tests completed!"
echo "======================================"
