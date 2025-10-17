export interface MetricPayload {
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
      kernel?: string;
      uptime_seconds: number;
    };
    cpu: {
      cores: number;
      model?: string;
      load?: {
        avg_1min: number;
        avg_5min: number;
        avg_15min: number;
      };
      current_usage?: {
        usage_percent: number;
      };
      usage_percent?: number; // Alternative format
    };
    memory: {
      total_bytes: number;
      used_bytes?: number;
      usage_percent: number;
    };
    disk: Array<{
      filesystem: string;
      size_bytes?: number;
      used_bytes?: number;
      use_percentage: number;
      mounted_on?: string;
    }>;
    network?: Array<{
      interface: string;
      state?: string;
      stats: {
        rx_bytes: number;
        tx_bytes: number;
      };
    }>;
    top_processes?: Array<{
      pid: number;
      cpu: number;
      mem: number;
      user?: string;
      command: string;
    }>;
  };
}

export interface JobSummary {
  id: number;
  githubJobId: string;
  githubRunId: string;
  name: string;
  status: string;
  conclusion: string | null;
  repository: string;
  branch: string | null;
  commitHash: string | null;
  workflowName: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface JobDetail extends JobSummary {
  logUrl: string | null;
  metrics: MetricData[];
}

export interface MetricData {
  id: number;
  timestamp: Date;
  hostname: string | null;
  cpuCores: number | null;
  cpuUsagePercent: number | null;
  memoryTotalBytes: bigint | null;
  memoryUsedBytes: bigint | null;
  memoryUsagePercent: number | null;
  diskUsagePercent: number | null;
  networkRxBytes: bigint | null;
  networkTxBytes: bigint | null;
  topProcesses: string | null;
}

export interface OrganizationResponse {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface RepositoryResponse {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
}
