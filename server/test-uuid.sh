#!/bin/bash

# Test retrieving metrics by job_uuid

API_URL="http://localhost:8080/api/metrics"
JOB_UUID="4c3ab6d1-ed7e-427f-a876-63022b6417c8"

echo "🔍 Testing Job UUID Retrieval Endpoint"
echo "==========================================="
echo ""
echo "Job UUID: $JOB_UUID"
echo ""

echo "📥 Retrieving all metrics for this job..."
curl -s "$API_URL/$JOB_UUID" | jq '.'

echo ""
echo "==========================================="
echo ""
echo "📊 Summary:"
curl -s "$API_URL/$JOB_UUID" | jq -r '
  if .success then
    "✅ Found \(.count) metric snapshots for this job\n\nTimestamps:\n" + 
    (.data | map("  - \(.timestamp)") | join("\n"))
  else
    "❌ Error: \(.message)"
  end
'
