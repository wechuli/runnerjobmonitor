import type {
  Organization,
  Repository,
  WorkflowRun,
  WorkflowJob,
  JobDetails,
  MetricDataPoint,
  AnalysisResult,
} from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    login: 'acme-corp',
    name: 'ACME Corporation',
    description: 'Building the future of cloud infrastructure',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AC',
  },
  {
    id: 2,
    login: 'github-demo',
    name: 'GitHub Demo',
    description: 'Demonstration organization for testing workflows',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=GD',
  },
  {
    id: 3,
    login: 'devops-team',
    name: 'DevOps Team',
    description: 'Infrastructure and automation specialists',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DT',
  },
];

const MOCK_REPOSITORIES: Record<string, Repository[]> = {
  'acme-corp': [
    {
      id: 101,
      name: 'backend-api',
      full_name: 'acme-corp/backend-api',
      description: 'Core backend API services',
      private: true,
      owner: 'acme-corp',
    },
    {
      id: 102,
      name: 'frontend-web',
      full_name: 'acme-corp/frontend-web',
      description: 'Main web application',
      private: true,
      owner: 'acme-corp',
    },
    {
      id: 103,
      name: 'infrastructure',
      full_name: 'acme-corp/infrastructure',
      description: 'Terraform and Kubernetes configurations',
      private: true,
      owner: 'acme-corp',
    },
  ],
  'github-demo': [
    {
      id: 201,
      name: 'metrics-collector-test',
      full_name: 'github-demo/metrics-collector-test',
      description: 'Testing repository for runner metrics collection',
      private: false,
      owner: 'github-demo',
    },
    {
      id: 202,
      name: 'sample-workflows',
      full_name: 'github-demo/sample-workflows',
      description: 'Collection of sample GitHub Actions workflows',
      private: false,
      owner: 'github-demo',
    },
  ],
  'devops-team': [
    {
      id: 301,
      name: 'ci-cd-pipeline',
      full_name: 'devops-team/ci-cd-pipeline',
      description: 'Centralized CI/CD pipeline configurations',
      private: true,
      owner: 'devops-team',
    },
    {
      id: 302,
      name: 'monitoring-stack',
      full_name: 'devops-team/monitoring-stack',
      description: 'Observability and monitoring infrastructure',
      private: true,
      owner: 'devops-team',
    },
  ],
};

const generateMockRuns = (repoName: string): WorkflowRun[] => {
  const baseDate = new Date('2025-01-14T10:00:00Z');
  return [
    {
      id: 1001,
      name: 'CI Pipeline',
      head_branch: 'main',
      status: 'completed',
      conclusion: 'success',
      created_at: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(baseDate.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      run_number: 234,
      event: 'push',
      actor: 'developer1',
    },
    {
      id: 1002,
      name: 'Build and Test',
      head_branch: 'feature/performance-improvements',
      status: 'completed',
      conclusion: 'failure',
      created_at: new Date(baseDate.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(baseDate.getTime() - 4.2 * 60 * 60 * 1000).toISOString(),
      run_number: 233,
      event: 'pull_request',
      actor: 'developer2',
    },
    {
      id: 1003,
      name: 'Deploy Staging',
      head_branch: 'main',
      status: 'in_progress',
      conclusion: null,
      created_at: new Date(baseDate.getTime() - 0.5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(baseDate.getTime() - 0.3 * 60 * 60 * 1000).toISOString(),
      run_number: 235,
      event: 'workflow_dispatch',
      actor: 'devops-bot',
    },
    {
      id: 1004,
      name: 'Security Scan',
      head_branch: 'main',
      status: 'completed',
      conclusion: 'success',
      created_at: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(baseDate.getTime() - 23.5 * 60 * 60 * 1000).toISOString(),
      run_number: 232,
      event: 'schedule',
      actor: 'github-actions[bot]',
    },
  ];
};

const MOCK_JOBS: Record<number, WorkflowJob[]> = {
  1001: [
    {
      id: 10001,
      run_id: 1001,
      name: 'lint',
      status: 'completed',
      conclusion: 'success',
      started_at: '2025-01-14T08:30:00Z',
      completed_at: '2025-01-14T08:32:15Z',
      runner_name: 'runner-01',
    },
    {
      id: 10002,
      run_id: 1001,
      name: 'test',
      status: 'completed',
      conclusion: 'success',
      started_at: '2025-01-14T08:32:30Z',
      completed_at: '2025-01-14T08:45:22Z',
      runner_name: 'runner-02',
    },
    {
      id: 10003,
      run_id: 1001,
      name: 'build',
      status: 'completed',
      conclusion: 'success',
      started_at: '2025-01-14T08:45:30Z',
      completed_at: '2025-01-14T09:02:18Z',
      runner_name: 'runner-01',
    },
  ],
  1002: [
    {
      id: 10004,
      run_id: 1002,
      name: 'lint',
      status: 'completed',
      conclusion: 'success',
      started_at: '2025-01-14T05:10:00Z',
      completed_at: '2025-01-14T05:11:42Z',
      runner_name: 'runner-03',
    },
    {
      id: 10005,
      run_id: 1002,
      name: 'test',
      status: 'completed',
      conclusion: 'failure',
      started_at: '2025-01-14T05:12:00Z',
      completed_at: '2025-01-14T05:28:35Z',
      runner_name: 'runner-02',
    },
  ],
  1003: [
    {
      id: 10006,
      run_id: 1003,
      name: 'deploy',
      status: 'in_progress',
      conclusion: null,
      started_at: '2025-01-14T09:30:00Z',
      completed_at: '2025-01-14T09:48:00Z',
      runner_name: 'runner-04',
    },
  ],
  1004: [
    {
      id: 10007,
      run_id: 1004,
      name: 'security-scan',
      status: 'completed',
      conclusion: 'success',
      started_at: '2025-01-13T10:00:00Z',
      completed_at: '2025-01-13T10:28:45Z',
      runner_name: 'runner-01',
    },
  ],
};

const generateMetricsTimeSeries = (jobId: number, durationMinutes: number): MetricDataPoint[] => {
  const dataPoints: MetricDataPoint[] = [];
  const startTime = new Date('2025-01-14T08:30:00Z');
  const intervalSeconds = 15;
  const numPoints = (durationMinutes * 60) / intervalSeconds;

  for (let i = 0; i < numPoints; i++) {
    const timestamp = new Date(startTime.getTime() + i * intervalSeconds * 1000);
    const progress = i / numPoints;
    
    let cpuUsage = 15 + Math.random() * 10;
    if (progress > 0.2 && progress < 0.6) {
      cpuUsage = 45 + Math.random() * 30;
    }
    if (progress > 0.7 && progress < 0.85) {
      cpuUsage = 75 + Math.random() * 20;
    }

    const memUsage = 8 + progress * 15 + Math.random() * 5;
    const diskUsage = 72 + progress * 3 + Math.random() * 2;

    dataPoints.push({
      timestamp: timestamp.toISOString().replace('T', ' ').substring(0, 19),
      github_context: {
        job_id: jobId,
        run_id: 1001,
        user: 'developer1',
        repository: 'acme-corp/backend-api',
      },
      system: {
        info: {
          hostname: 'runner-vm-01',
          uptime_seconds: 46 + i * intervalSeconds,
        },
        cpu: {
          cores: 2,
          usage_percent: parseFloat(cpuUsage.toFixed(2)),
        },
        memory: {
          total_bytes: 8330170368,
          usage_percent: parseFloat(memUsage.toFixed(2)),
        },
        disk: [
          {
            filesystem: '/dev/root',
            use_percentage: Math.floor(diskUsage),
          },
        ],
        top_processes: [
          {
            pid: 1814,
            cpu: parseFloat((cpuUsage * 0.7).toFixed(1)),
            mem: parseFloat((memUsage * 0.5).toFixed(1)),
            command: 'Runner.Worker',
          },
          {
            pid: 2103,
            cpu: parseFloat((cpuUsage * 0.2).toFixed(1)),
            mem: parseFloat((memUsage * 0.3).toFixed(1)),
            command: 'node',
          },
        ],
      },
    });
  }

  return dataPoints;
};

const MOCK_LOGS = `2025-01-14T08:30:00.123Z [INFO] Runner started
2025-01-14T08:30:00.456Z [INFO] Checking out repository acme-corp/backend-api@main
2025-01-14T08:30:02.789Z [INFO] Setting up Node.js 20.x
2025-01-14T08:30:05.234Z [INFO] Installing dependencies
2025-01-14T08:30:15.567Z [INFO] npm install completed successfully
2025-01-14T08:30:16.890Z [INFO] Running linter
2025-01-14T08:30:18.123Z [INFO] ✓ All files pass linting rules
2025-01-14T08:30:18.456Z [INFO] Starting test suite
2025-01-14T08:30:22.789Z [INFO] Running unit tests...
2025-01-14T08:32:45.234Z [INFO] ✓ 247 tests passed
2025-01-14T08:32:45.567Z [INFO] Running integration tests...
2025-01-14T08:38:12.890Z [INFO] ✓ 42 integration tests passed
2025-01-14T08:38:13.123Z [INFO] Generating coverage report
2025-01-14T08:38:18.456Z [INFO] Coverage: 87.3% statements, 82.1% branches
2025-01-14T08:38:18.789Z [INFO] Starting build process
2025-01-14T08:38:20.234Z [INFO] Compiling TypeScript...
2025-01-14T08:42:35.567Z [INFO] TypeScript compilation complete
2025-01-14T08:42:36.890Z [INFO] Bundling application...
2025-01-14T08:48:22.123Z [INFO] Bundle optimization complete
2025-01-14T08:48:24.456Z [INFO] Build artifacts created successfully
2025-01-14T08:48:24.789Z [INFO] Running post-build checks
2025-01-14T08:48:26.234Z [INFO] ✓ All post-build checks passed
2025-01-14T08:48:26.567Z [SUCCESS] Job completed successfully in 18m 26s`;

export const fetchOrganizations = async (): Promise<Organization[]> => {
  await delay(200 + Math.random() * 200);
  return MOCK_ORGANIZATIONS;
};

export const fetchRepositories = async (org: string): Promise<Repository[]> => {
  await delay(150 + Math.random() * 150);
  return MOCK_REPOSITORIES[org] || [];
};

export const fetchWorkflowRuns = async (
  owner: string,
  repo: string
): Promise<WorkflowRun[]> => {
  await delay(200 + Math.random() * 200);
  return generateMockRuns(repo);
};

export const fetchWorkflowJobs = async (runId: number): Promise<WorkflowJob[]> => {
  await delay(150 + Math.random() * 100);
  return MOCK_JOBS[runId] || [];
};

export const fetchJobDetails = async (jobId: number): Promise<JobDetails> => {
  await delay(300 + Math.random() * 200);
  
  let job: WorkflowJob | undefined;
  for (const jobs of Object.values(MOCK_JOBS)) {
    job = jobs.find(j => j.id === jobId);
    if (job) break;
  }

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const durationMinutes = job.completed_at
    ? (new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 60000
    : 5;

  return {
    job,
    metrics: generateMetricsTimeSeries(jobId, durationMinutes),
    logs: MOCK_LOGS,
  };
};

export const analyzeJob = async (jobId: number): Promise<AnalysisResult> => {
  await delay(2000 + Math.random() * 1000);

  return {
    summary:
      'The job execution completed successfully but showed significant CPU utilization spikes during the build phase, reaching up to 94% usage. Memory consumption remained stable throughout execution with a gradual increase to 23% by completion.',
    recommendations: [
      'Consider upgrading to a 4-core runner instance for build-heavy workflows to reduce execution time',
      'Implement build caching to reduce CPU-intensive compilation steps',
      'Monitor memory usage trends; current levels are healthy but approaching 25% threshold',
      'Review the build optimization settings in your bundler configuration',
    ],
    insights: [
      {
        metric: 'CPU Usage',
        observation: 'Peak CPU usage of 94% observed during TypeScript compilation phase (minutes 12-16)',
        severity: 'high',
      },
      {
        metric: 'Memory Usage',
        observation: 'Steady memory growth from 8% to 23%, indicating normal garbage collection behavior',
        severity: 'low',
      },
      {
        metric: 'Disk Usage',
        observation: 'Disk usage remained stable at 74-75%, well within acceptable limits',
        severity: 'low',
      },
      {
        metric: 'Build Time',
        observation: 'Total build time of 18m 26s is above the team average of 14m 30s',
        severity: 'medium',
      },
    ],
  };
};
