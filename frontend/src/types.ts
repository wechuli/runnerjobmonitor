export interface Organization {
  id: number;
  login: string;
  name: string;
  avatarUrl: string | null;
}

export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commit: string;
  createdAt: number;
  updatedAt: number;
  htmlUrl: string;
}

export interface Job {
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
  startedAt: string | null;
  completedAt: string | null;
  logUrl: string | null;
}

export interface JobDetail extends Job {
  metrics: Metric[];
}

export interface Metric {
  id: number;
  timestamp: string;
  hostname: string | null;
  cpuCores: number | null;
  cpuUsagePercent: number | null;
  memoryTotalBytes: string | null;
  memoryUsedBytes: string | null;
  memoryUsagePercent: number | null;
  diskUsagePercent: number | null;
  networkRxBytes: string | null;
  networkTxBytes: string | null;
  topProcesses: string | null;
}

export interface MetricChartData {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
}
