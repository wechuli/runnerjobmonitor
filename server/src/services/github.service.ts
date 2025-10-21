import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import fs from 'fs';

const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
const GITHUB_PRIVATE_KEY_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH || '';

let privateKey = '';
if (GITHUB_PRIVATE_KEY_PATH && fs.existsSync(GITHUB_PRIVATE_KEY_PATH)) {
  privateKey = fs.readFileSync(GITHUB_PRIVATE_KEY_PATH, 'utf8');
}

export class GitHubService {
  private octokit: Octokit;

  constructor(installationId?: number) {
    if (installationId && GITHUB_APP_ID && privateKey) {
      // Create an authenticated Octokit instance for a specific installation
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: GITHUB_APP_ID,
          privateKey: privateKey,
          installationId: installationId,
        },
      });
    } else {
      // Create a basic Octokit instance (for public data or with token)
      this.octokit = new Octokit();
    }
  }

  async getJobLogs(owner: string, repo: string, jobId: number): Promise<string> {
    try {
      const response = await this.octokit.rest.actions.downloadJobLogsForWorkflowRun({
        owner,
        repo,
        job_id: jobId,
      });

      // The response.data will be the log content
      return response.data as unknown as string;
    } catch (error) {
      console.error('Error fetching job logs from GitHub:', error);
      throw new Error('Failed to fetch job logs');
    }
  }

  async getInstallationRepositories(installationId: number): Promise<any[]> {
    try {
      const response = await this.octokit.rest.apps.listReposAccessibleToInstallation();
      return response.data.repositories || [];
    } catch (error) {
      console.error('Error fetching installation repositories:', error);
      return [];
    }
  }

  async getWorkflowRuns(owner: string, repo: string, perPage = 20): Promise<any[]> {
    try {
      const response = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: perPage,
      });
      return response.data.workflow_runs || [];
    } catch (error) {
      console.error('Error fetching workflow runs:', error);
      return [];
    }
  }

  async getWorkflowRunJobs(owner: string, repo: string, runId: number): Promise<any[]> {
    try {
      const response = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: runId,
      });
      return response.data.jobs || [];
    } catch (error) {
      console.error('Error fetching workflow run jobs:', error);
      return [];
    }
  }
}
