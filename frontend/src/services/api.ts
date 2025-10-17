import { Organization, Repository, WorkflowRun, Job, JobDetail } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE_URL}/organizations`);
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },

  // Repositories
  async getRepositories(org: string): Promise<Repository[]> {
    const response = await fetch(`${API_BASE_URL}/orgs/${org}/repos`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  },

  // Workflow Runs
  async getWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
    const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/runs`);
    if (!response.ok) throw new Error('Failed to fetch workflow runs');
    return response.json();
  },

  // Jobs
  async getJobsForRun(runId: string): Promise<Job[]> {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async getJobDetail(jobId: number): Promise<JobDetail> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch job details');
    return response.json();
  },

  // Analysis
  async analyzeJob(jobId: number): Promise<{ analysis: string }> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/analyze`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to analyze job');
    return response.json();
  },
};
