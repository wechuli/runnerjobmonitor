
export interface LogEntry {
  timestamp: number; // Unix timestamp in milliseconds
  message: string;
}

export interface ResourceUsage {
  timestamp: number; // Unix timestamp in milliseconds
  cpu: number; // percentage
  memory: number; // in MB
  disk: number; // percentage
  networkIn: number; // in MB/s
  networkOut: number; // in MB/s
}

export interface MachineInfo {
  os: string;
  architecture: string;
}

export interface RunData {
  id: string;
  workflow: string;
  startTime: number;
  endTime: number;
  logs: LogEntry[];
  resources: ResourceUsage[];
  machineInfo: MachineInfo;
}

export type RunStatus = 'success' | 'failure' | 'in_progress';

// New lightweight summary type for lists
export interface WorkflowRunSummary {
  id: string;
  name: string;
  status: RunStatus;
  branch: string;
  commit: string; // commit hash
  duration: number; // in seconds
  createdAt: number; // timestamp
}

// The full run data, extending the summary
export interface WorkflowRun extends WorkflowRunSummary {
  runData: RunData;
}


export interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  runs: WorkflowRunSummary[]; // Use the summary type for lists
}

export interface Organization {
  id: number;
  login: string;
  name: string;
  avatarUrl: string;
  repositories: Repository[];
}
