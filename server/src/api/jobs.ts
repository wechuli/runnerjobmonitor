import { Router } from 'express';
import prisma from '../db';
import { GeminiService } from '../services/gemini.service';
import { StorageService } from '../services/storage.service';

const router = Router();

// GET /api/jobs/:jobId - Get detailed information about a specific job
router.get('/:jobId', async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        metrics: {
          orderBy: {
            timestamp: 'asc',
          },
          select: {
            id: true,
            timestamp: true,
            hostname: true,
            cpuCores: true,
            cpuUsagePercent: true,
            memoryTotalBytes: true,
            memoryUsedBytes: true,
            memoryUsagePercent: true,
            diskUsagePercent: true,
            networkRxBytes: true,
            networkTxBytes: true,
            topProcesses: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// POST /api/jobs/:jobId/analyze - Analyze a job with Gemini AI
router.post('/:jobId/analyze', async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        metrics: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Fetch logs from storage or use empty string if not available
    let logs = '';
    if (job.logUrl) {
      const storageService = new StorageService();
      logs = (await storageService.getJobLogs(job.githubJobId)) || '';
    }

    // Analyze with Gemini
    const geminiService = new GeminiService();
    const analysis = await geminiService.analyzeJob(
      job.name,
      job.workflowName || 'Unknown Workflow',
      job.metrics,
      logs
    );

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing job:', error);
    res.status(500).json({ error: 'Failed to analyze job' });
  }
});

export default router;
