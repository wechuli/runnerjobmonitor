import { Router } from 'express';
import prisma from '../db';
import { MetricPayload } from '../types';

const router = Router();

// POST /api/metrics - Receive metric data from runners
router.post('/', async (req, res) => {
  try {
    const payload: MetricPayload = req.body;

    // Validate required fields
    if (!payload.timestamp || !payload.github_context || !payload.system) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { job_id, run_id, repository } = payload.github_context;

    if (!job_id || !run_id) {
      return res.status(400).json({ error: 'Missing job_id or run_id in github_context' });
    }

    // Find the job in the database
    let job = await prisma.job.findUnique({
      where: { githubJobId: job_id.toString() },
    });

    // If job doesn't exist, create it
    if (!job) {
      // Try to find an installation for this repository
      const [owner] = repository.split('/');
      const installation = await prisma.installation.findFirst({
        where: { accountLogin: owner },
      });

      if (!installation) {
        console.warn(`No installation found for repository ${repository}`);
        return res.status(404).json({ error: 'Installation not found for this repository' });
      }

      job = await prisma.job.create({
        data: {
          githubJobId: job_id.toString(),
          githubRunId: run_id.toString(),
          name: `Job ${job_id}`,
          status: 'in_progress',
          repository: repository,
          installationId: installation.id,
          startedAt: new Date(),
        },
      });
    }

    // Parse timestamp
    const timestamp = new Date(payload.timestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
    }

    // Extract metric data
    const cpuUsage = payload.system.cpu.current_usage?.usage_percent || payload.system.cpu.usage_percent;
    const memoryUsed = payload.system.memory.used_bytes;
    const diskUsage = payload.system.disk[0]?.use_percentage;
    const networkRx = payload.system.network?.[0]?.stats.rx_bytes;
    const networkTx = payload.system.network?.[0]?.stats.tx_bytes;

    // Create metric record
    await prisma.metric.create({
      data: {
        jobId: job.id,
        timestamp: timestamp,
        hostname: payload.system.info.hostname,
        cpuCores: payload.system.cpu.cores,
        cpuUsagePercent: cpuUsage,
        memoryTotalBytes: payload.system.memory.total_bytes,
        memoryUsedBytes: memoryUsed || null,
        memoryUsagePercent: payload.system.memory.usage_percent,
        diskUsagePercent: diskUsage,
        networkRxBytes: networkRx ? BigInt(networkRx) : null,
        networkTxBytes: networkTx ? BigInt(networkTx) : null,
        topProcesses: payload.system.top_processes
          ? JSON.stringify(payload.system.top_processes)
          : null,
        rawPayload: JSON.stringify(payload),
      },
    });

    res.status(202).json({ message: 'Metric accepted' });
  } catch (error) {
    console.error('Error processing metric:', error);
    res.status(500).json({ error: 'Failed to process metric' });
  }
});

export default router;
