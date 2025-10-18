# API Integration Guide

This guide is for backend developers who need to implement the API endpoints that will replace the mock service.

## Overview

The frontend expects a RESTful API with the following characteristics:

- **Base URL:** `/api/v1` (configurable)
- **Authentication:** Bearer token (GitHub OAuth)
- **Content-Type:** `application/json`
- **Error Format:** Standard HTTP status codes with JSON error messages

---

## Authentication

### GitHub OAuth Flow

The frontend will redirect users to GitHub OAuth and expect a callback with an authorization code.

**OAuth Redirect (Frontend):**
```
https://github.com/login/oauth/authorize?
  client_id={YOUR_CLIENT_ID}&
  redirect_uri={YOUR_CALLBACK_URL}&
  scope=repo,user
```

**Callback Endpoint (Backend):**
```
POST /auth/github/callback
Content-Type: application/json

{
  "code": "authorization_code_from_github"
}

Response:
{
  "access_token": "jwt_token",
  "user": {
    "login": "username",
    "avatar_url": "https://...",
    "id": 12345,
    "email": "user@example.com"
  }
}
```

**Token Usage:**
All subsequent requests include:
```
Authorization: Bearer {access_token}
```

---

## API Endpoints

### 1. List Organizations

**Endpoint:** `GET /api/v1/organizations`

**Description:** Returns all organizations the authenticated user has access to.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "login": "acme-corp",
    "name": "ACME Corporation",
    "description": "Building the future of cloud infrastructure",
    "avatar_url": "https://avatars.githubusercontent.com/..."
  }
]
```

**TypeScript Type:**
```typescript
interface Organization {
  id: number;
  login: string;
  name: string;
  description: string;
  avatar_url: string;
}
```

---

### 2. List Repositories

**Endpoint:** `GET /api/v1/organizations/:org/repositories`

**Description:** Returns repositories in the specified organization.

**Path Parameters:**
- `org` - Organization login (e.g., "acme-corp")

**Response:** `200 OK`
```json
[
  {
    "id": 101,
    "name": "backend-api",
    "full_name": "acme-corp/backend-api",
    "description": "Core backend API services",
    "private": true,
    "owner": "acme-corp"
  }
]
```

**TypeScript Type:**
```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: string;
}
```

---

### 3. List Workflow Runs

**Endpoint:** `GET /api/v1/repositories/:owner/:repo/runs`

**Description:** Returns recent workflow runs for a repository.

**Path Parameters:**
- `owner` - Repository owner (e.g., "acme-corp")
- `repo` - Repository name (e.g., "backend-api")

**Query Parameters (Optional):**
- `status` - Filter by status: `completed`, `in_progress`, `queued`
- `conclusion` - Filter by conclusion: `success`, `failure`, `cancelled`
- `limit` - Number of results (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": 1001,
    "name": "CI Pipeline",
    "head_branch": "main",
    "status": "completed",
    "conclusion": "success",
    "created_at": "2025-01-14T08:00:00Z",
    "updated_at": "2025-01-14T08:30:00Z",
    "run_number": 234,
    "event": "push",
    "actor": "developer1"
  }
]
```

**TypeScript Type:**
```typescript
interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  created_at: string;  // ISO 8601 format
  updated_at: string;  // ISO 8601 format
  run_number: number;
  event: string;
  actor: string;
}
```

---

### 4. List Jobs

**Endpoint:** `GET /api/v1/runs/:runId/jobs`

**Description:** Returns all jobs associated with a workflow run.

**Path Parameters:**
- `runId` - Workflow run ID

**Response:** `200 OK`
```json
[
  {
    "id": 10001,
    "run_id": 1001,
    "name": "lint",
    "status": "completed",
    "conclusion": "success",
    "started_at": "2025-01-14T08:30:00Z",
    "completed_at": "2025-01-14T08:32:15Z",
    "runner_name": "runner-01"
  }
]
```

**TypeScript Type:**
```typescript
interface WorkflowJob {
  id: number;
  run_id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  started_at: string;
  completed_at: string;
  runner_name: string;
}
```

---

### 5. Get Job Details

**Endpoint:** `GET /api/v1/jobs/:jobId/details`

**Description:** Returns detailed metrics and logs for a specific job.

**Path Parameters:**
- `jobId` - Job ID

**Response:** `200 OK`
```json
{
  "job": {
    "id": 10001,
    "run_id": 1001,
    "name": "lint",
    "status": "completed",
    "conclusion": "success",
    "started_at": "2025-01-14T08:30:00Z",
    "completed_at": "2025-01-14T08:32:15Z",
    "runner_name": "runner-01"
  },
  "metrics": [
    {
      "timestamp": "2025-01-14 08:30:16",
      "github_context": {
        "job_id": 10001,
        "run_id": 1001,
        "user": "developer1",
        "repository": "acme-corp/backend-api"
      },
      "system": {
        "info": {
          "hostname": "runner-vm-01",
          "uptime_seconds": 46
        },
        "cpu": {
          "cores": 2,
          "usage_percent": 32.94
        },
        "memory": {
          "total_bytes": 8330170368,
          "usage_percent": 8.78
        },
        "disk": [
          {
            "filesystem": "/dev/root",
            "use_percentage": 74
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
  ],
  "logs": "2025-01-14T08:30:00.123Z [INFO] Runner started\n..."
}
```

**TypeScript Types:**
```typescript
interface JobDetails {
  job: WorkflowJob;
  metrics: MetricDataPoint[];
  logs: string;
}

interface MetricDataPoint {
  timestamp: string;
  github_context: {
    job_id: number;
    run_id: number;
    user: string;
    repository: string;
  };
  system: {
    info: {
      hostname: string;
      uptime_seconds: number;
    };
    cpu: {
      cores: number;
      usage_percent: number;
    };
    memory: {
      total_bytes: number;
      usage_percent: number;
    };
    disk: Array<{
      filesystem: string;
      use_percentage: number;
    }>;
    top_processes: Array<{
      pid: number;
      cpu: number;
      mem: number;
      command: string;
    }>;
  };
}
```

**Important Notes:**
- Metrics should be ordered chronologically by timestamp
- Timestamps should be in `YYYY-MM-DD HH:MM:SS` format
- Logs should be plain text with newline separators
- Metrics should be collected at regular intervals (e.g., every 15 seconds)

---

### 6. Analyze Job (AI Analysis)

**Endpoint:** `POST /api/v1/jobs/:jobId/analyze`

**Description:** Triggers AI analysis of job performance metrics.

**Path Parameters:**
- `jobId` - Job ID

**Response:** `200 OK`
```json
{
  "summary": "The job execution completed successfully but showed significant CPU utilization spikes...",
  "recommendations": [
    "Consider upgrading to a 4-core runner instance",
    "Implement build caching to reduce CPU-intensive steps"
  ],
  "insights": [
    {
      "metric": "CPU Usage",
      "observation": "Peak CPU usage of 94% observed during compilation",
      "severity": "high"
    }
  ]
}
```

**TypeScript Type:**
```typescript
interface AnalysisResult {
  summary: string;
  recommendations: string[];
  insights: Array<{
    metric: string;
    observation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}
```

**Processing Time:**
- This endpoint may take 2-5 seconds to respond
- Consider implementing async processing with polling if analysis is complex

---

## Error Handling

### Standard Error Format

All errors should return a JSON object with:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

### HTTP Status Codes

| Status | Usage |
|--------|-------|
| `200 OK` | Successful request |
| `201 Created` | Resource created |
| `400 Bad Request` | Invalid request parameters |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | User lacks permission |
| `404 Not Found` | Resource doesn't exist |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Job with ID 12345 not found"
  }
}
```

**403 Forbidden:**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this organization"
  }
}
```

---

## Rate Limiting

Implement rate limiting to prevent abuse:

**Recommended Limits:**
- Anonymous: 60 requests/hour
- Authenticated: 5000 requests/hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1642147200
```

---

## CORS Configuration

The backend must allow requests from the frontend domain:

```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

For development:
```
Access-Control-Allow-Origin: http://localhost:5173
```

---

## WebSocket API (Optional - Future Enhancement)

For real-time metric updates:

**Endpoint:** `wss://api.example.com/v1/jobs/:jobId/metrics`

**Protocol:**
```json
// Client subscribes
{
  "action": "subscribe",
  "job_id": 10001
}

// Server sends updates
{
  "type": "metric_update",
  "data": {
    "timestamp": "2025-01-14 08:30:16",
    "system": { /* metric data */ }
  }
}

// Client unsubscribes
{
  "action": "unsubscribe"
}
```

---

## Database Schema Recommendations

### Tables

**organizations**
- id (PK)
- login (unique)
- name
- description
- avatar_url
- created_at

**repositories**
- id (PK)
- organization_id (FK)
- name
- full_name (unique)
- description
- private (boolean)
- created_at

**workflow_runs**
- id (PK)
- repository_id (FK)
- name
- head_branch
- status
- conclusion
- created_at
- updated_at
- run_number
- event
- actor

**workflow_jobs**
- id (PK)
- run_id (FK)
- name
- status
- conclusion
- started_at
- completed_at
- runner_name

**job_metrics**
- id (PK)
- job_id (FK)
- timestamp
- cpu_usage_percent
- memory_usage_percent
- disk_usage_percent
- metrics_json (JSONB for full metric data)

**job_logs**
- id (PK)
- job_id (FK)
- log_text (TEXT)
- created_at

---

## Testing the API

### Sample cURL Commands

**Get Organizations:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.example.com/v1/organizations
```

**Get Job Details:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.example.com/v1/jobs/10001/details
```

**Analyze Job:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.example.com/v1/jobs/10001/analyze
```

### Postman Collection

Consider creating a Postman collection with:
- All endpoints documented
- Example requests and responses
- Authentication setup
- Environment variables

---

## Performance Considerations

### Caching
- Cache organization/repository lists (5-10 minutes)
- Cache completed job metrics (indefinitely)
- Use ETags for conditional requests

### Pagination
For large result sets:
```
GET /api/v1/repositories/owner/repo/runs?page=2&per_page=20

Response Headers:
Link: <.../runs?page=3>; rel="next", <.../runs?page=1>; rel="prev"
X-Total-Count: 156
```

### Database Indexes
- Index on `workflow_runs.repository_id`
- Index on `workflow_jobs.run_id`
- Index on `job_metrics.job_id` and `timestamp`
- Composite index on `workflow_runs (repository_id, created_at DESC)`

---

## Security Best Practices

1. **Token Storage:** Store tokens hashed in database
2. **Token Expiry:** Implement token expiration (e.g., 30 days)
3. **HTTPS Only:** Enforce TLS for all API communication
4. **Input Validation:** Validate and sanitize all inputs
5. **SQL Injection:** Use parameterized queries
6. **Authorization:** Verify user permissions for each resource
7. **Audit Logging:** Log all access to sensitive data

---

## Deployment Checklist

- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] GitHub OAuth app registered
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging configured (e.g., Sentry)
- [ ] API documentation published
- [ ] Health check endpoint (`/health`)
- [ ] Monitoring and alerts set up
- [ ] Load testing completed

---

## Support

For frontend integration questions, refer to:
- `README.md` - General setup
- `docs/APPLICATION_OVERVIEW.md` - Architecture details
- `QUICK_START.md` - Development guide

For API specification questions, contact the backend team lead or refer to OpenAPI/Swagger documentation.
