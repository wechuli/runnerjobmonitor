import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample installation
  const installation = await prisma.installation.upsert({
    where: { githubInstallationId: '12345678' },
    update: {},
    create: {
      githubInstallationId: '12345678',
      accountLogin: 'acme-corp',
      accountType: 'Organization',
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=Acme',
    },
  });

  console.log('✓ Created installation:', installation.accountLogin);

  // Create sample jobs
  const job1 = await prisma.job.upsert({
    where: { githubJobId: '111111111' },
    update: {},
    create: {
      githubJobId: '111111111',
      githubRunId: '999999999',
      name: 'build-and-test',
      status: 'completed',
      conclusion: 'success',
      repository: 'acme-corp/frontend-app',
      branch: 'main',
      commitHash: 'abc123f',
      workflowName: 'CI/CD Pipeline',
      runnerName: 'ubuntu-latest',
      runnerOs: 'ubuntu-22.04',
      runnerArch: 'X64',
      startedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      completedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      installationId: installation.id,
    },
  });

  console.log('✓ Created job:', job1.name);

  // Create sample metrics for the job
  const startTime = job1.startedAt!.getTime();
  const metricsCount = 30; // 30 data points

  for (let i = 0; i < metricsCount; i++) {
    const timestamp = new Date(startTime + i * 10000); // Every 10 seconds
    const cpuUsage = 10 + Math.random() * 80; // 10-90% CPU
    const memoryPercent = 5 + Math.random() * 20; // 5-25% Memory
    const diskPercent = 40 + Math.random() * 10; // 40-50% Disk

    await prisma.metric.create({
      data: {
        jobId: job1.id,
        timestamp,
        hostname: 'runner-vm-001',
        cpuCores: 2,
        cpuUsagePercent: cpuUsage,
        memoryTotalBytes: BigInt(8 * 1024 * 1024 * 1024), // 8GB
        memoryUsedBytes: BigInt(Math.floor((8 * 1024 * 1024 * 1024 * memoryPercent) / 100)),
        memoryUsagePercent: memoryPercent,
        diskUsagePercent: diskPercent,
        networkRxBytes: BigInt(Math.floor(Math.random() * 1000000)),
        networkTxBytes: BigInt(Math.floor(Math.random() * 100000)),
        topProcesses: JSON.stringify([
          { pid: 1234, cpu: 45.2, mem: 5.3, command: 'node' },
          { pid: 5678, cpu: 32.1, mem: 3.2, command: 'npm' },
        ]),
        rawPayload: JSON.stringify({
          timestamp: timestamp.toISOString(),
          github_context: {
            job_id: parseInt(job1.githubJobId),
            run_id: parseInt(job1.githubRunId),
          },
          system: {
            cpu: { usage_percent: cpuUsage },
            memory: { usage_percent: memoryPercent },
          },
        }),
      },
    });
  }

  console.log(`✓ Created ${metricsCount} metrics for job ${job1.name}`);

  // Create a failed job
  const job2 = await prisma.job.upsert({
    where: { githubJobId: '222222222' },
    update: {},
    create: {
      githubJobId: '222222222',
      githubRunId: '888888888',
      name: 'deploy',
      status: 'completed',
      conclusion: 'failure',
      repository: 'acme-corp/backend-api',
      branch: 'develop',
      commitHash: 'def456a',
      workflowName: 'Deployment',
      runnerName: 'ubuntu-latest',
      runnerOs: 'ubuntu-22.04',
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      completedAt: new Date(Date.now() - 7 * 60 * 1000), // 7 minutes ago
      installationId: installation.id,
    },
  });

  console.log('✓ Created job:', job2.name);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
