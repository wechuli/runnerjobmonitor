#!/bin/bash

# Load all sample data into the API

API_URL="http://localhost:8080/api/metrics"

echo "🚀 Loading sample data into the database..."
echo "==========================================="
echo ""

# Load each sample file
for i in {1..8}; do
  if [ -f "src/data/sample$i.json" ] || [ -f "src/data/sample.json" ]; then
    FILE="src/data/sample.json"
    if [ $i -gt 1 ]; then
      FILE="src/data/sample$i.json"
    fi
    
    if [ -f "$FILE" ]; then
      echo "📤 Loading $FILE..."
      RESPONSE=$(curl -s -X POST $API_URL \
        -H "Content-Type: application/json" \
        -d @$FILE)
      
      echo "$RESPONSE" | jq -r 'if .success then "✅ Success: \(.message)" else "❌ Error: \(.message)" end'
      echo ""
    fi
  fi
done

echo "==========================================="
echo "✨ Sample data loading complete!"
echo ""
echo "📊 View all metrics:"
echo "   curl http://localhost:8080/api/metrics"
