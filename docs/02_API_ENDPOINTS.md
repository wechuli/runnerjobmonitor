# API Endpoints Documentation

## Base URL
```
http://localhost:3001
```

## Data Ingestion Endpoints

### POST /webhooks/github
Handles GitHub webhook events for installation and workflow_job events.

**Headers:**
```
X-GitHub-Event: workflow_job | installation
X-Hub-Signature-256: sha256=<signature>
X-GitHub-Delivery: <delivery-id>
```

**Events Handled:**
- `installation.created`: Creates an installation record
- `installation.deleted`: Removes an installation record
- `workflow_job.queued`: Creates a job record
- `workflow_job.in_progress`: Updates job status
- `workflow_job.completed`: Fetches logs, uploads to GCP, marks job complete

**Response:**
```json
{
  "message": "Webhook processed"
}
```

---

### POST /api/metrics
Receives system metrics from runners during job execution.

**Request Body:**
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

**Response:**
```json
{
  "message": "Metric accepted"
}
```

---

## UI Data Fetching Endpoints

### GET /api/organizations
Lists all organizations where the app is installed.

**Response:**
```json
[
  {
    "id": 1,
    "login": "acme-corp",
    "name": "Acme Corporation",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456"
  }
]
```

---

### GET /api/orgs/:org/repos
Lists repositories for a selected organization.

**Parameters:**
- `org`: Organization login (e.g., "acme-corp")

**Response:**
```json
[
  {
    "owner": "acme-corp",
    "name": "frontend-app",
    "fullName": "acme-corp/frontend-app",
    "description": "Main frontend application"
  }
]
```

---

### GET /api/repos/:owner/:repo/runs
Lists workflow runs for a selected repository.

**Parameters:**
- `owner`: Repository owner (e.g., "acme-corp")
- `repo`: Repository name (e.g., "frontend-app")

**Response:**
```json
[
  {
    "id": 987654321,
    "name": "CI/CD Pipeline",
    "status": "completed",
    "conclusion": "success",
    "branch": "main",
    "commit": "abc123f",
    "createdAt": 1704067200000,
    "updatedAt": 1704067500000,
    "htmlUrl": "https://github.com/acme-corp/frontend-app/actions/runs/987654321"
  }
]
```

---

### GET /api/runs/:runId/jobs
Lists all jobs for a specific workflow run.

**Parameters:**
- `runId`: Workflow run ID

**Response:**
```json
[
  {
    "id": 1,
    "githubJobId": "123456789",
    "githubRunId": "987654321",
    "name": "build",
    "status": "completed",
    "conclusion": "success",
    "repository": "acme-corp/frontend-app",
    "branch": "main",
    "commitHash": "abc123f",
    "workflowName": "CI/CD Pipeline",
    "startedAt": "2025-01-01T12:00:00Z",
    "completedAt": "2025-01-01T12:05:00Z",
    "logUrl": "https://storage.googleapis.com/bucket/job-logs/123456789.txt"
  }
]
```

---

### GET /api/jobs/:jobId
Retrieves detailed information about a specific job, including metrics.

**Parameters:**
- `jobId`: Internal job ID (not GitHub job ID)

**Response:**
```json
{
  "id": 1,
  "githubJobId": "123456789",
  "githubRunId": "987654321",
  "name": "build",
  "status": "completed",
  "conclusion": "success",
  "repository": "acme-corp/frontend-app",
  "branch": "main",
  "commitHash": "abc123f",
  "workflowName": "CI/CD Pipeline",
  "startedAt": "2025-01-01T12:00:00Z",
  "completedAt": "2025-01-01T12:05:00Z",
  "logUrl": "https://storage.googleapis.com/bucket/job-logs/123456789.txt",
  "metrics": [
    {
      "id": 1,
      "timestamp": "2025-01-01T12:00:00Z",
      "hostname": "runner-vm",
      "cpuCores": 2,
      "cpuUsagePercent": 32.5,
      "memoryTotalBytes": "8330170368",
      "memoryUsedBytes": "731701248",
      "memoryUsagePercent": 8.78,
      "diskUsagePercent": 74.0,
      "networkRxBytes": "11016906",
      "networkTxBytes": "247371",
      "topProcesses": "[{\"pid\":1814,\"cpu\":66.1,\"mem\":1.4,\"command\":\"Runner.Worker\"}]"
    }
  ]
}
```

---

## Analysis Endpoint

### POST /api/jobs/:jobId/analyze
Triggers AI analysis of a job using Gemini API.

**Parameters:**
- `jobId`: Internal job ID

**Response:**
```json
{
  "analysis": "### Performance Summary\n\nThe job completed successfully in 5 minutes...\n\n### Bottlenecks Identified\n\n* High CPU usage during npm install phase\n* Memory usage remained stable throughout\n\n### Recommendations\n\n* Consider using a cached node_modules to reduce CPU usage\n* Current runner size appears appropriate for this workload"
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployments, consider implementing rate limiting to prevent abuse.

## Authentication

The API currently does not require authentication for data fetching endpoints. In a production environment, implement proper authentication using:
- GitHub OAuth for user authentication
- JWT tokens for API access
- Webhook signature verification for GitHub webhooks (already implemented)
