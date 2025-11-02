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
      current_usage: {
        usage_percent: number;
      };
    };
    memory: {
      total_bytes: number;
      used_bytes: number;
      free_bytes?: number;
      available_bytes?: number;
      usage_percent: number;
    };
    disk: Array<{
      filesystem: string;
      size_bytes: number;
      used_bytes: number;
      available_bytes: number;
      use_percentage: number;
      mounted_on?: string;
    }>;
    top_processes: Array<{
      pid: number;
      cpu: number;
      mem: number;
      command: string;
      user?: string;
    }>;
  };
}
