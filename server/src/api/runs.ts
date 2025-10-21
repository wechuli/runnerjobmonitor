import { Router } from 'express';
import prisma from '../db';
import { GitHubService } from '../services/github.service';

const router = Router();

// GET /api/repos/:owner/:repo/runs - List workflow runs for a repository
router.get('/:owner/:repo/runs', async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Find the installation for this organization
    const installation = await prisma.installation.findFirst({
      where: { accountLogin: owner },
    });

    if (!installation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    // Fetch workflow runs from GitHub
    const githubService = new GitHubService(parseInt(installation.githubInstallationId));
    const runs = await githubService.getWorkflowRuns(owner, repo);

    const workflowRuns = runs.map((run: any) => ({
      id: run.id,
      name: run.name || run.display_title,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      commit: run.head_sha?.substring(0, 7),
      createdAt: new Date(run.created_at).getTime(),
      updatedAt: new Date(run.updated_at).getTime(),
      htmlUrl: run.html_url,
    }));

    res.json(workflowRuns);
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({ error: 'Failed to fetch workflow runs' });
  }
});

// GET /api/runs/:runId/jobs - List jobs for a specific workflow run
router.get('/:runId/jobs', async (req, res) => {
  try {
    const { runId } = req.params;

    // First, try to find jobs in our database
    const jobs = await prisma.job.findMany({
      where: { githubRunId: runId },
      select: {
        id: true,
        githubJobId: true,
        githubRunId: true,
        name: true,
        status: true,
        conclusion: true,
        repository: true,
        branch: true,
        commitHash: true,
        workflowName: true,
        startedAt: true,
        completedAt: true,
        logUrl: true,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // If we have jobs in the database, return them
    if (jobs.length > 0) {
      return res.json(jobs);
    }

    // Otherwise, fetch from GitHub API
    // We need to parse the repository from the first job we might have
    // For now, return empty array if no jobs found
    res.json([]);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

export default router;
