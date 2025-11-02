const API_BASE_URL = "http://localhost:8080";

interface JobMetric {
  timestamp: string;
  job_uuid: string;
  github_context: {
    user: string;
    repositories: Array<{
      name: string;
      owner: string;
      url: string;
    }>;
  };
  system: {
    info: {
      hostname: string;
      platform: string;
      architecture: string;
      cpu_count: number;
      total_memory_bytes: number;
      uptime_seconds: number;
    };
    cpu: {
      cores: number;
      usage_percent: number;
    };
    memory: {
      total_bytes: number;
      used_bytes: number;
      available_bytes: number;
      usage_percent: number;
    };
    disk: Array<{
      filesystem: string;
      size_bytes: number;
      used_bytes: number;
      available_bytes: number;
      use_percentage: number;
      mount_point: string;
    }>;
    network: Array<{
      interface: string;
      bytes_sent: number;
      bytes_recv: number;
      packets_sent: number;
      packets_recv: number;
    }>;
    top_processes: Array<{
      pid: number;
      cpu: number;
      mem: number;
      command: string;
    }>;
  };
}

interface MetricsResponse {
  success: boolean;
  count: number;
  data: JobMetric[];
}

export const getJobMetrics = async (
  jobUuid: string
): Promise<MetricsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/metrics/${jobUuid}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return response.json();
};

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  insights: Array<{
    metric: string;
    observation: string;
    severity: "low" | "medium" | "high";
  }>;
}

export const analyzeMetrics = async (
  jobUuid: string
): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/${jobUuid}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze metrics: ${response.statusText}`);
  }

  return response.json();
};
