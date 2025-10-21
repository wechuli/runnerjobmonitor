import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';

// Import route handlers
import organizationsRouter from './api/organizations';
import repositoriesRouter from './api/repositories';
import runsRouter from './api/runs';
import jobsRouter from './api/jobs';
import metricsRouter from './api/metrics';
import webhooksRouter from './api/webhooks';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/organizations', organizationsRouter);
app.use('/api/orgs', repositoriesRouter);
app.use('/api/repos', runsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/webhooks', webhooksRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
