You are an expert full-stack software architect specializing in DevOps tools and cloud-native applications. Your task is to generate a comprehensive technical specification and project plan for building a **GitHub Actions Runner Observability Tool**.

-----

### **Project Overview**

The goal is to create a web application that provides observability into self-hosted or ephemeral GitHub Actions runners. It will collect and visualize real-time resource metrics (CPU, memory, disk, etc.) during a workflow run, analyze the corresponding job logs, and use an LLM (Gemini) to diagnose performance issues and provide recommendations, such as adjusting the runner's machine size.

-----

### **Technology Stack**

  * **Frontend:** React with TypeScript
  * **Backend:** Express.js with TypeScript
  * **Database:** SQLite (for initial development)
  * **Authentication:** GitHub OAuth App
  * **Log Storage:** Google Cloud Platform (GCP) Storage
  * **AI Integration:** Google Gemini API

-----

### **Core Workflow & Data Flow**

1.  **Authentication:** The user logs into the web application via a GitHub OAuth App, ensuring they can only access data from repositories they have permission to see.

2.  **Job Initiation:**

      * When a job is `queued` or `in_progress`, GitHub sends a `workflow_job` webhook to our Express.js backend.
      * The backend extracts key information (e.g., `run_id`, `job_id`, `repository`) and creates a new entry for this job in the SQLite database.

3.  **Metric Collection:**

      * A pre-existing custom GitHub Action starts a background process on the runner.
      * This process periodically collects system metrics and sends them to a dedicated endpoint on our backend. Each data packet must include the `job_id` for proper association.

4.  **Job Completion & Log Processing:**

      * When the job is `completed`, GitHub sends another `workflow_job` webhook.
      * The backend is triggered to:
          * Download the full logs for that specific job using the GitHub API.
          * Upload the logs to a GCP Storage bucket for persistent storage.
          * Update the job's status to "completed" in the database.

5.  **Frontend Visualization and Analysis:**

      * The React frontend displays a dashboard for each job.
      * It fetches and visualizes the time-series metric data (e.g., CPU/memory usage over time) using charts.
      * It streams the job logs directly from the backend (which can retrieve them from GCP).
      * A dedicated "Analyze with Gemini" feature allows the user to send the collected metrics and the job logs to the Gemini API for automated analysis and recommendations.

-----

### **Metric Data Structure**

The following JSON object is the structure of the data sent from the runner's background process to the backend. The `github_context` will be enriched with the `job_id` and `run_id`.

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
      "hostname": "runnervmwhb2z",
      "kernel": "6.11.0-1018-azure",
      "uptime_seconds": 46
    },
    "cpu": {
      "cores": 2,
      "model": "AMD EPYC 7763 64-Core Processor",
      "load": {
        "avg_1min": 0.39,
        "avg_5min": 0.12,
        "avg_15min": 0.04
      },
      "current_usage": {
        "usage_percent": 32.94
      }
    },
    "memory": {
      "total_bytes": 8330170368,
      "used_bytes": 731701248,
      "usage_percent": 8.78
    },
    "disk": [
      {
        "filesystem": "/dev/root",
        "size_bytes": 76887154688,
        "used_bytes": 56262660096,
        "use_percentage": 74,
        "mounted_on": "/"
      }
    ],
    "network": [
      {
        "interface": "eth0",
        "state": "UP",
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
        "user": "runner",
        "command": "/home/runner/actions-runner/cached/bin/Runner.Worker spawnclient 142 145"
      }
    ]
  }
}
```

-----

### **Your Task: Generate the Following**

Based on the information above, please provide a detailed project plan broken down into the following sections:

1.  **Architecture Overview:** A brief description of the system architecture (e.g., Microservices vs. Monolith, data flow diagram description).
2.  **Database Schema:** Define the necessary SQLite tables, columns (with data types), and relationships. At a minimum, include tables for `Users`, `Jobs`, and `Metrics`.
3.  **Backend API Endpoints:** Outline the required REST API endpoints. For each endpoint, specify the HTTP method, URL path, purpose, and example request/response bodies (e.g., `POST /api/metrics`, `POST /webhooks/github`, `GET /api/jobs/:jobId`).
4.  **Frontend Component Breakdown:** List the primary React components needed for the UI (e.g., `Dashboard`, `JobDetailPage`, `MetricsChart`, `LogViewer`, `GeminiAnalysisView`) and briefly describe the responsibility of each.
5.  **Gemini Integration Plan:** Explain the prompt engineering strategy. What specific context (metrics summary, log snippets, system info) should be provided to Gemini to get the most accurate and useful recommendations? Provide an example prompt.
