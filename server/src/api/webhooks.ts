import { Router } from 'express';
import { Webhooks } from '@octokit/webhooks';
import prisma from '../db';
import { GitHubService } from '../services/github.service';
import { StorageService } from '../services/storage.service';

const router = Router();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'development-secret';
const webhooks = new Webhooks({
  secret: WEBHOOK_SECRET,
});

// Handle installation events
webhooks.on('installation.created', async ({ payload }) => {
  console.log('GitHub App installed:', payload.installation.id);

  try {
    const installation = payload.installation;
    const account = installation.account;

    await prisma.installation.create({
      data: {
        githubInstallationId: installation.id.toString(),
        accountLogin: account?.login || 'unknown',
        accountType: account?.type || 'Organization',
        avatarUrl: account?.avatar_url || null,
      },
    });

    console.log('Installation record created for:', account?.login);
  } catch (error) {
    console.error('Error creating installation record:', error);
  }
});

// Handle installation deletion
webhooks.on('installation.deleted', async ({ payload }) => {
  console.log('GitHub App uninstalled:', payload.installation.id);

  try {
    await prisma.installation.delete({
      where: { githubInstallationId: payload.installation.id.toString() },
    });

    console.log('Installation record deleted');
  } catch (error) {
    console.error('Error deleting installation record:', error);
  }
});

// Handle workflow_job events
webhooks.on('workflow_job', async ({ payload }) => {
  const job = payload.workflow_job;
  const action = payload.action;
  const repository = payload.repository;

  console.log(`Workflow job ${action}:`, job.id, job.name);

  try {
    // Find the installation for this repository
    const [owner] = repository.full_name.split('/');
    const installation = await prisma.installation.findFirst({
      where: { accountLogin: owner },
    });

    if (!installation) {
      console.warn(`No installation found for repository ${repository.full_name}`);
      return;
    }

    if (action === 'queued' || action === 'in_progress') {
      // Create or update job record
      const jobData = {
        githubJobId: job.id.toString(),
        githubRunId: job.run_id.toString(),
        name: job.name,
        status: action,
        repository: repository.full_name,
        branch: job.head_branch || null,
        commitHash: job.head_sha || null,
        workflowName: job.workflow_name || null,
        runnerName: job.runner_name || null,
        runnerOs: job.labels?.find((l: string) => l.includes('ubuntu') || l.includes('windows') || l.includes('macos')) || null,
        installationId: installation.id,
        startedAt: action === 'in_progress' && job.started_at ? new Date(job.started_at) : null,
      };

      await prisma.job.upsert({
        where: { githubJobId: job.id.toString() },
        update: jobData,
        create: jobData,
      });

      console.log('Job record created/updated:', job.id);
    } else if (action === 'completed') {
      // Update job status and fetch logs
      const existingJob = await prisma.job.findUnique({
        where: { githubJobId: job.id.toString() },
      });

      if (!existingJob) {
        console.warn(`Job ${job.id} not found in database`);
        return;
      }

      // Fetch and upload logs
      let logUrl: string | null = null;
      try {
        const githubService = new GitHubService(parseInt(installation.githubInstallationId));
        const [owner, repo] = repository.full_name.split('/');
        const logs = await githubService.getJobLogs(owner, repo, job.id);

        const storageService = new StorageService();
        logUrl = await storageService.uploadJobLogs(job.id.toString(), logs);

        console.log('Logs uploaded to storage:', logUrl);
      } catch (error) {
        console.error('Error fetching/uploading logs:', error);
      }

      // Update job
      await prisma.job.update({
        where: { githubJobId: job.id.toString() },
        data: {
          status: 'completed',
          conclusion: job.conclusion,
          completedAt: job.completed_at ? new Date(job.completed_at) : new Date(),
          logUrl: logUrl,
        },
      });

      console.log('Job completed:', job.id);
    }
  } catch (error) {
    console.error('Error processing workflow_job webhook:', error);
  }
});

// POST /webhooks/github - Main webhook endpoint
router.post('/github', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const event = req.headers['x-github-event'] as string;

  if (!signature) {
    console.warn('No signature provided in webhook request');
    return res.status(401).send('Unauthorized');
  }

  try {
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'] as string,
      name: event as any,
      signature: signature,
      payload: JSON.stringify(req.body),
    });

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

export default router;
