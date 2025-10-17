import express, { Express } from 'express';
import cors from 'cors';
import * as db from './database';
import { ResourceUsage } from '../types';

// --- TYPE DEFINITION FOR INCOMING RUNNER DATA ---
interface RunnerStreamData {
  timestamp: string;
  system: {
    cpu: { current_usage: { usage_percent: number } };
    memory: { used_bytes: number };
    disk: { use_percentage: number }[];
    network: { stats: { rx_bytes: number; tx_bytes: number } }[];
  };
}


const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
// FIX: Explicitly providing a path to app.use() helps TypeScript resolve the correct overload for the express.json() middleware.
app.use('/', express.json());

// --- API ROUTES ---

app.get('/api/organizations', async (req, res) => {
  const orgs = await db.getOrganizations();
  res.json(orgs);
});

app.get('/api/repos/:owner', async (req, res) => {
    const { owner } = req.params;
    const repos = await db.getReposByOrg(owner);
    if (repos.length > 0) {
        res.json(repos);
    } else {
        res.status(404).send('Organization not found');
    }
});

app.get('/api/repos/:owner/:repoName/runs', async (req, res) => {
  const { owner, repoName } = req.params;
  const runs = await db.getRunsByRepo(owner, repoName);
  res.json(runs);
});

app.get('/api/runs/:runId', async (req, res) => {
  const { runId } = req.params;
  const details = await db.getRunDetails(runId);
  if (details) {
    res.json(details);
  } else {
    res.status(404).send('Run not found');
  }
});

// --- DATA INGESTION ROUTES ---

app.post('/api/runs/:runId/resources', async (req, res) => {
  const { runId } = req.params;
  const metric: RunnerStreamData = req.body;

  try {
    const timestamp = new Date(metric.timestamp + 'Z').getTime(); // Assume UTC
    if (isNaN(timestamp)) {
        return res.status(400).send('Invalid timestamp format');
    }

    // Transform detailed data into the simplified format for storage/display
    const simplifiedMetric: Omit<ResourceUsage & {rawPayload: string}, 'networkIn' | 'networkOut'> = {
      timestamp,
      cpu: metric.system.cpu.current_usage.usage_percent,
      memory: metric.system.memory.used_bytes / (1024 * 1024), // Convert bytes to MB
      disk: metric.system.disk[0]?.use_percentage || 0,
      rawPayload: JSON.stringify(metric),
    };

    // Calculate network speed
    const lastMetric = await db.getLastResourceMetric(runId);
    let networkIn = 0;
    let networkOut = 0;

    if (lastMetric && lastMetric.timestamp < timestamp) {
      const lastPayload: RunnerStreamData = JSON.parse(lastMetric.rawPayload);
      const timeDeltaSeconds = (timestamp - lastMetric.timestamp) / 1000;
      
      if (timeDeltaSeconds > 0) {
        const bytesInDelta = (metric.system.network[0]?.stats.rx_bytes || 0) - (lastPayload.system.network[0]?.stats.rx_bytes || 0);
        const bytesOutDelta = (metric.system.network[0]?.stats.tx_bytes || 0) - (lastPayload.system.network[0]?.stats.tx_bytes || 0);

        // Convert bytes/sec to MB/s
        networkIn = (bytesInDelta / timeDeltaSeconds) / (1024 * 1024);
        networkOut = (bytesOutDelta / timeDeltaSeconds) / (1024 * 1024);
      }
    }
    
    await db.addResourceMetric(runId, { ...simplifiedMetric, networkIn, networkOut });
    res.status(202).send('Metric accepted');
  } catch (error) {
    console.error("Error processing metric:", error);
    res.status(500).send('Error processing metric');
  }
});

app.post('/api/webhook/github', async (req, res) => {
    const event = req.header('X-GitHub-Event');
    const { action, workflow_run } = req.body;

    if (event === 'workflow_run' && action === 'completed') {
        const githubRunId = workflow_run.id.toString();
        console.log(`Received completion webhook for GitHub run ID: ${githubRunId}`);
        await db.completeRunByGithubId(githubRunId, workflow_run.conclusion);
        res.status(200).send(`Webhook for run ${githubRunId} processed.`);
    } else {
        res.status(200).send('Webhook received, but not a completion event. No action taken.');
    }
});

const startServer = async () => {
    await db.initializeDatabase();
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });
};

startServer();