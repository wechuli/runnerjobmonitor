import AppDataSource from "./data-source";
import { Installation } from "./models/Installation";
import { Job } from "./models/Job";
import { Metric } from "./models/Metric";

async function main() {
  console.log("\ud83c\udf31 Seeding database (TypeORM)...");

  await AppDataSource.initialize();

  const installationRepo = AppDataSource.getRepository(Installation);
  const jobRepo = AppDataSource.getRepository(Job);
  const metricRepo = AppDataSource.getRepository(Metric);

  const existing = await installationRepo.findOne({
    where: { githubInstallationId: "12345678" },
  });
  let installation = existing as Installation | null;
  if (!existing) {
    installation = installationRepo.create({
      githubInstallationId: "12345678",
      accountLogin: "acme-corp",
      accountType: "Organization",
      avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=Acme",
    });
    await installationRepo.save(installation);
  }

  console.log("\u2713 Created installation:", installation!.accountLogin);

  // Create sample jobs
  let job1 = await jobRepo.findOne({ where: { githubJobId: "111111111" } });
  if (!job1) {
    job1 = jobRepo.create({
      githubJobId: "111111111",
      githubRunId: "999999999",
      name: "build-and-test",
      status: "completed",
      conclusion: "success",
      repository: "acme-corp/frontend-app",
      branch: "main",
      commitHash: "abc123f",
      workflowName: "CI/CD Pipeline",
      runnerName: "ubuntu-latest",
      runnerOs: "ubuntu-22.04",
      runnerArch: "X64",
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 1000),
      installationId: installation!.id,
    });
    await jobRepo.save(job1);
  }

  console.log("\u2713 Created job:", job1.name);

  // Create sample metrics for the job
  const startTime = job1.startedAt!.getTime();
  const metricsCount = 30; // 30 data points

  for (let i = 0; i < metricsCount; i++) {
    const timestamp = new Date(startTime + i * 10000); // Every 10 seconds
    const cpuUsage = 10 + Math.random() * 80; // 10-90% CPU
    const memoryPercent = 5 + Math.random() * 20; // 5-25% Memory
    const diskPercent = 40 + Math.random() * 10; // 40-50% Disk

    const metric = metricRepo.create({
      jobId: job1.id,
      timestamp,
      hostname: "runner-vm-001",
      cpuCores: 2,
      cpuUsagePercent: cpuUsage,
      memoryTotalBytes: BigInt(8 * 1024 * 1024 * 1024).toString(),
      memoryUsedBytes: BigInt(
        Math.floor((8 * 1024 * 1024 * 1024 * memoryPercent) / 100)
      ).toString(),
      memoryUsagePercent: memoryPercent,
      diskUsagePercent: diskPercent,
      networkRxBytes: BigInt(Math.floor(Math.random() * 1000000)).toString(),
      networkTxBytes: BigInt(Math.floor(Math.random() * 100000)).toString(),
      topProcesses: JSON.stringify([
        { pid: 1234, cpu: 45.2, mem: 5.3, command: "node" },
        { pid: 5678, cpu: 32.1, mem: 3.2, command: "npm" },
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
    });
    await metricRepo.save(metric);
  }

  console.log(`\u2713 Created ${metricsCount} metrics for job ${job1.name}`);

  // Create a failed job
  let job2 = await jobRepo.findOne({ where: { githubJobId: "222222222" } });
  if (!job2) {
    job2 = jobRepo.create({
      githubJobId: "222222222",
      githubRunId: "888888888",
      name: "deploy",
      status: "completed",
      conclusion: "failure",
      repository: "acme-corp/backend-api",
      branch: "develop",
      commitHash: "def456a",
      workflowName: "Deployment",
      runnerName: "ubuntu-latest",
      runnerOs: "ubuntu-22.04",
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      completedAt: new Date(Date.now() - 7 * 60 * 1000),
      installationId: installation!.id,
    });
    await jobRepo.save(job2);
  }

  console.log("\u2713 Created job:", job2.name);

  console.log("\u2705 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });
