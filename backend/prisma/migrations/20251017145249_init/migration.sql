-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubInstallationId" TEXT NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Installation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubJobId" TEXT NOT NULL,
    "githubRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "conclusion" TEXT,
    "repository" TEXT NOT NULL,
    "branch" TEXT,
    "commitHash" TEXT,
    "workflowName" TEXT,
    "runnerName" TEXT,
    "runnerOs" TEXT,
    "runnerArch" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "logUrl" TEXT,
    "installationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "hostname" TEXT,
    "cpuCores" INTEGER,
    "cpuUsagePercent" REAL,
    "memoryTotalBytes" BIGINT,
    "memoryUsedBytes" BIGINT,
    "memoryUsagePercent" REAL,
    "diskUsagePercent" REAL,
    "networkRxBytes" BIGINT,
    "networkTxBytes" BIGINT,
    "topProcesses" TEXT,
    "rawPayload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metric_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_githubInstallationId_key" ON "Installation"("githubInstallationId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_githubJobId_key" ON "Job"("githubJobId");

-- CreateIndex
CREATE INDEX "Metric_jobId_timestamp_idx" ON "Metric"("jobId", "timestamp");
