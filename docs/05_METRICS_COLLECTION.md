# Metrics Collection Guide

This document explains how to collect metrics from GitHub Actions runners and send them to the observability backend.

## Overview

The observability tool requires runners to send periodic system metrics during job execution. This is typically done using a custom GitHub Action or a shell script that runs in the background.

## Metric Data Format

The backend expects metrics in the following JSON format:

```json
{
  "timestamp": "2025-10-14 14:57:16",
  "github_context": {
    "job_id": 123456789,
    "run_id": 987654321,
    "user": "wechuli",
    "repository": "githubuserdemo/ghametricscollectortest"
  },
  "system": {
    "info": {
      "hostname": "runner-vm",
      "uptime_seconds": 46
    },
    "cpu": {
      "cores": 2,
      "usage_percent": 32.94
    },
    "memory": {
      "total_bytes": 8330170368,
      "used_bytes": 731701248,
      "usage_percent": 8.78
    },
    "disk": [
      {
        "filesystem": "/dev/root",
        "use_percentage": 74
      }
    ],
    "network": [
      {
        "interface": "eth0",
        "stats": {
          "rx_bytes": 11016906,
          "tx_bytes": 247371
        }
      }
    ],
    "top_processes": [
      {
        "pid": 1814,
        "cpu": 66.1,
        "mem": 1.4,
        "command": "Runner.Worker"
      }
    ]
  }
}
```

## Collection Methods

### Method 1: Shell Script (Linux/macOS)

Create a script that collects and sends metrics:

```bash
#!/bin/bash

API_URL="${METRICS_API_URL:-http://localhost:3001/api/metrics}"
INTERVAL="${METRICS_INTERVAL:-10}"
JOB_ID="${GITHUB_JOB_ID}"
RUN_ID="${GITHUB_RUN_ID}"

# Start metrics collection in background
collect_metrics() {
  while true; do
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")
    HOSTNAME=$(hostname)
    UPTIME=$(awk '{print int($1)}' /proc/uptime)
    CPU_CORES=$(nproc)
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    MEM_TOTAL=$(awk '/MemTotal/ {print $2*1024}' /proc/meminfo)
    MEM_USED=$(awk '/MemTotal/ {total=$2} /MemAvailable/ {avail=$2} END {print (total-avail)*1024}' /proc/meminfo)
    MEM_PERCENT=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

    # Construct JSON payload
    PAYLOAD=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "github_context": {
    "job_id": $JOB_ID,
    "run_id": $RUN_ID,
    "user": "$GITHUB_ACTOR",
    "repository": "$GITHUB_REPOSITORY"
  },
  "system": {
    "info": {
      "hostname": "$HOSTNAME",
      "uptime_seconds": $UPTIME
    },
    "cpu": {
      "cores": $CPU_CORES,
      "usage_percent": $CPU_USAGE
    },
    "memory": {
      "total_bytes": $MEM_TOTAL,
      "used_bytes": $MEM_USED,
      "usage_percent": $MEM_PERCENT
    },
    "disk": [{
      "filesystem": "/dev/root",
      "use_percentage": $DISK_USAGE
    }]
  }
}
EOF
)

    # Send to API
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD" \
      -s -o /dev/null -w "%{http_code}\n" || echo "Failed to send metrics"

    sleep $INTERVAL
  done
}

collect_metrics &
METRICS_PID=$!
echo $METRICS_PID > /tmp/metrics_pid

# Wait for parent process to finish
wait
```

**Usage in GitHub Actions:**

```yaml
name: Build and Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Start metrics collection
        run: |
          curl -o /tmp/collect-metrics.sh https://raw.githubusercontent.com/your-org/metrics-collector/main/collect-metrics.sh
          chmod +x /tmp/collect-metrics.sh
          METRICS_API_URL=https://your-backend.com/api/metrics \
          GITHUB_JOB_ID=${{ github.job }} \
          GITHUB_RUN_ID=${{ github.run_id }} \
          /tmp/collect-metrics.sh &
          echo $! > /tmp/metrics_pid
      
      - name: Your build steps
        run: |
          npm install
          npm run build
          npm test
      
      - name: Stop metrics collection
        if: always()
        run: |
          if [ -f /tmp/metrics_pid ]; then
            kill $(cat /tmp/metrics_pid) || true
          fi
```

### Method 2: Custom GitHub Action

Create a reusable action for metrics collection:

**action.yml:**
```yaml
name: 'Runner Metrics Collector'
description: 'Collects and sends runner metrics to observability backend'
inputs:
  api-url:
    description: 'Metrics API endpoint URL'
    required: true
  interval:
    description: 'Collection interval in seconds'
    required: false
    default: '10'
  job-id:
    description: 'GitHub job ID'
    required: true
  run-id:
    description: 'GitHub run ID'
    required: true

runs:
  using: 'composite'
  steps:
    - name: Install dependencies
      shell: bash
      run: |
        sudo apt-get update -qq
        sudo apt-get install -y bc jq sysstat
    
    - name: Start metrics collection
      shell: bash
      run: |
        # Your collection script here
        # See the shell script example above
```

**Usage:**
```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Collect metrics
    uses: your-org/runner-metrics-collector@v1
    with:
      api-url: https://your-backend.com/api/metrics
      job-id: ${{ github.job }}
      run-id: ${{ github.run_id }}
```

### Method 3: Python Script

For more complex metric collection:

```python
#!/usr/bin/env python3
import json
import time
import psutil
import requests
import os
from datetime import datetime

API_URL = os.getenv('METRICS_API_URL', 'http://localhost:3001/api/metrics')
INTERVAL = int(os.getenv('METRICS_INTERVAL', '10'))
JOB_ID = os.getenv('GITHUB_JOB_ID')
RUN_ID = os.getenv('GITHUB_RUN_ID')

def collect_metrics():
    while True:
        # System information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        net_io = psutil.net_io_counters()
        
        # Get top processes
        top_processes = []
        for proc in sorted(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']),
                          key=lambda p: p.info['cpu_percent'],
                          reverse=True)[:5]:
            try:
                top_processes.append({
                    'pid': proc.info['pid'],
                    'cpu': proc.info['cpu_percent'],
                    'mem': proc.info['memory_percent'],
                    'command': proc.info['name']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Build payload
        payload = {
            'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'github_context': {
                'job_id': int(JOB_ID),
                'run_id': int(RUN_ID),
                'user': os.getenv('GITHUB_ACTOR', 'unknown'),
                'repository': os.getenv('GITHUB_REPOSITORY', 'unknown')
            },
            'system': {
                'info': {
                    'hostname': os.uname().nodename,
                    'uptime_seconds': int(time.time() - psutil.boot_time())
                },
                'cpu': {
                    'cores': psutil.cpu_count(),
                    'usage_percent': cpu_percent
                },
                'memory': {
                    'total_bytes': memory.total,
                    'used_bytes': memory.used,
                    'usage_percent': memory.percent
                },
                'disk': [{
                    'filesystem': '/',
                    'use_percentage': disk.percent
                }],
                'network': [{
                    'interface': 'eth0',
                    'stats': {
                        'rx_bytes': net_io.bytes_recv,
                        'tx_bytes': net_io.bytes_sent
                    }
                }],
                'top_processes': top_processes
            }
        }
        
        # Send to API
        try:
            response = requests.post(API_URL, json=payload, timeout=5)
            if response.status_code != 202:
                print(f"Warning: API returned {response.status_code}")
        except Exception as e:
            print(f"Error sending metrics: {e}")
        
        time.sleep(INTERVAL)

if __name__ == '__main__':
    collect_metrics()
```

## Best Practices

1. **Collection Interval**: 10-15 seconds is recommended
   - Too frequent: Unnecessary overhead
   - Too infrequent: Missing important spikes

2. **Error Handling**: Don't fail the job if metrics fail to send
   - Use `|| true` in bash
   - Wrap in try-catch in Python
   - Log errors for debugging

3. **Background Execution**: Run metrics collection in the background
   - Don't block the main workflow
   - Ensure cleanup on job completion

4. **Authentication**: If needed, use GitHub tokens or API keys
   - Store in GitHub Secrets
   - Pass as environment variables

5. **Resource Usage**: Keep collection lightweight
   - Minimal CPU/memory overhead
   - Efficient data structures
   - Avoid blocking operations

## Troubleshooting

### Metrics not appearing in the dashboard

1. **Check API endpoint is accessible:**
```bash
curl -v https://your-backend.com/health
```

2. **Verify job_id and run_id are correct:**
```bash
echo "Job ID: ${{ github.job }}"
echo "Run ID: ${{ github.run_id }}"
```

3. **Check backend logs:**
```bash
pm2 logs runner-monitor-backend
```

4. **Test with curl:**
```bash
curl -X POST https://your-backend.com/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2025-01-01 12:00:00","github_context":{"job_id":1,"run_id":1,"user":"test","repository":"test/repo"},"system":{"cpu":{"usage_percent":50}}}'
```

### High resource usage

1. Increase collection interval
2. Reduce number of metrics collected
3. Optimize collection script
4. Use more efficient tools (e.g., `psutil` in Python)

### Permission errors

1. Ensure script has execute permissions
2. Check if tools are installed (sysstat, procps)
3. Verify API endpoint is accessible
4. Check firewall rules

## Example: Complete Workflow

```yaml
name: Build with Metrics

on: [push]

env:
  METRICS_API_URL: https://monitor.example.com/api/metrics

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Python for metrics
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install metrics dependencies
        run: |
          pip install psutil requests
      
      - name: Start metrics collection
        run: |
          curl -o /tmp/collect_metrics.py https://raw.githubusercontent.com/your-org/metrics/main/collect.py
          python /tmp/collect_metrics.py \
            --api-url ${{ env.METRICS_API_URL }} \
            --job-id ${{ github.job }} \
            --run-id ${{ github.run_id }} &
          echo $! > /tmp/metrics_pid
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test
      
      - name: Stop metrics collection
        if: always()
        run: |
          kill $(cat /tmp/metrics_pid) 2>/dev/null || true
```

## Advanced: Metrics Collection Action

For a production-ready solution, consider creating a dedicated GitHub Action that:
- Handles startup and cleanup automatically
- Supports multiple platforms (Linux, macOS, Windows)
- Includes error handling and retries
- Provides detailed logging
- Supports authentication
- Is configurable via inputs

This would make metrics collection as simple as:
```yaml
- uses: your-org/collect-runner-metrics@v1
  with:
    api-url: ${{ secrets.METRICS_API_URL }}
```
