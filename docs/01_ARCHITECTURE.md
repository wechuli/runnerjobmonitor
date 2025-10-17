# System Architecture

## Overview

The GitHub Actions Runner Observability Tool is a full-stack web application that provides real-time monitoring and AI-powered analysis of GitHub Actions workflow jobs. The system is built as a monorepo with separate frontend and backend applications.

## Architecture Diagram

```
┌─────────────┐
│   GitHub    │
│  Actions    │◄──────┐
│  Runner     │       │
└──────┬──────┘       │
       │              │
       │ Metrics      │ Logs
       │ (POST)       │ (GET)
       │              │
       ▼              │
┌─────────────────────┴────┐
│   Express.js Backend     │
│  ┌────────────────────┐  │
│  │   API Routes       │  │
│  │  - /api/metrics    │  │
│  │  - /webhooks/...   │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │   Services         │  │
│  │  - GitHub          │  │
│  │  - GCP Storage     │  │
│  │  - Gemini AI       │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │   Prisma ORM       │  │
│  └────────┬───────────┘  │
└───────────┼──────────────┘
            │
            ▼
    ┌──────────────┐
    │   SQLite DB  │
    └──────────────┘

┌──────────────────────────┐
│   React Frontend         │
│  ┌────────────────────┐  │
│  │   Pages            │  │
│  │  - Organizations   │  │
│  │  - Repositories    │  │
│  │  - Workflow Runs   │  │
│  │  - Job Details     │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │   Components       │  │
│  │  - MetricsChart    │  │
│  │  - LogViewer       │  │
│  │  - GeminiAnalysis  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Data Flow

### 1. Installation & Setup
1. User installs the GitHub App on their organization/account
2. GitHub sends an `installation.created` webhook to the backend
3. Backend stores installation details in the database

### 2. Workflow Job Initiation
1. A workflow is triggered in GitHub Actions
2. GitHub sends a `workflow_job` webhook with `action: queued` or `action: in_progress`
3. Backend creates a Job record in the database

### 3. Metric Collection
1. A custom GitHub Action runs on the runner and collects system metrics
2. Metrics are sent to `POST /api/metrics` endpoint
3. Backend associates metrics with the job and stores them in the database

### 4. Job Completion
1. GitHub sends a `workflow_job` webhook with `action: completed`
2. Backend:
   - Fetches job logs from GitHub API
   - Uploads logs to GCP Storage
   - Updates job status to completed
   - Stores the GCP Storage URL

### 5. Frontend Visualization
1. User navigates through: Organizations → Repositories → Workflow Runs → Job Details
2. Frontend fetches data from REST API endpoints
3. Job Detail Page displays:
   - Metrics as time-series charts
   - Link to logs in GCP Storage
   - Option to analyze with Gemini AI

### 6. AI Analysis
1. User clicks "Analyze with Gemini"
2. Frontend sends request to `POST /api/jobs/:jobId/analyze`
3. Backend:
   - Retrieves metrics and logs for the job
   - Sends structured prompt to Gemini API
   - Returns AI-generated analysis and recommendations
4. Frontend displays the formatted analysis

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **GitHub Integration**: @octokit/rest, @octokit/webhooks
- **Cloud Storage**: Google Cloud Storage
- **AI**: Google Gemini API

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Chakra UI
- **Charts**: Recharts
- **Build Tool**: Vite

## Database Schema

See Prisma schema at `backend/prisma/schema.prisma` for the complete database structure.

Key models:
- **User**: GitHub user information
- **Installation**: GitHub App installations
- **Job**: Workflow job records
- **Metric**: Time-series system metrics

## Security Considerations

1. **GitHub App Authentication**: Uses GitHub App private key for API authentication
2. **Webhook Verification**: Verifies webhook signatures using the webhook secret
3. **Access Control**: Jobs are associated with installations to ensure proper access control
4. **API Keys**: Sensitive credentials stored in environment variables
5. **GCP Storage**: Logs stored securely with signed URLs for temporary access

## Scalability Considerations

1. **Database**: SQLite is suitable for development; migrate to PostgreSQL for production
2. **Metrics Storage**: Consider time-series database (e.g., TimescaleDB) for large-scale deployments
3. **Log Storage**: GCP Storage provides scalable, durable log storage
4. **Caching**: Consider adding Redis for caching frequently accessed data
5. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse
