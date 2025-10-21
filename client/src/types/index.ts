export interface Organization {
  id: number;
  login: string;
  name: string;
  description: string;
  avatar_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  created_at: string;
  updated_at: string;
  run_number: number;
  event: string;
  actor: string;
}

export interface WorkflowJob {
  id: number;
  run_id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  started_at: string;
  completed_at: string;
  runner_name: string;
}

export interface MetricDataPoint {
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

export interface JobDetails {
  job: WorkflowJob;
  metrics: MetricDataPoint[];
  logs: string;
}

export interface AnalysisResult {
  summary: string;
  recommendations: string[];
  insights: Array<{
    metric: string;
    observation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}
