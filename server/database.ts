
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import type { Organization, Repository, RunData, WorkflowRun, RunStatus, MachineInfo, ResourceUsage, LogEntry, WorkflowRunSummary } from '../types';

let db: Database;

const DB_PATH = process.env.DB_PATH || './actions_monitor.db';

export async function initializeDatabase() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  console.log(`Database connected at ${DB_PATH}`);

  await db.exec('PRAGMA foreign_keys = ON;');

  // --- SCHEMA CREATION ---
  await db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatarUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fullName TEXT UNIQUE NOT NULL,
      description TEXT,
      organizationId INTEGER NOT NULL,
      FOREIGN KEY(organizationId) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS workflow_runs (
      id TEXT PRIMARY KEY,
      github_run_id TEXT UNIQUE,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      branch TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      duration_s INTEGER,
      created_at INTEGER NOT NULL,
      start_time INTEGER,
      end_time INTEGER,
      workflow_name TEXT,
      machine_os TEXT,
      machine_arch TEXT,
      repository_id INTEGER NOT NULL,
      FOREIGN KEY(repository_id) REFERENCES repositories(id)
    );
    
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        message TEXT NOT NULL,
        run_id TEXT NOT NULL,
        FOREIGN KEY(run_id) REFERENCES workflow_runs(id)
    );

    CREATE TABLE IF NOT EXISTS resource_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        cpu REAL,
        memory REAL,
        disk REAL,
        networkIn REAL,
        networkOut REAL,
        rawPayload TEXT,
        run_id TEXT NOT NULL,
        FOREIGN KEY(run_id) REFERENCES workflow_runs(id)
    );
  `);

  // --- DATA SEEDING (if db is empty) ---
  const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
  if (orgCount.count === 0) {
    console.log('Database is empty, seeding with mock data...');
    await seedData();
  }
}

// --- DATA ACCESS FUNCTIONS ---

export const getOrganizations = async (): Promise<Omit<Organization, 'repositories'>[]> => {
    return db.all('SELECT id, login, name, avatarUrl FROM organizations');
};

export const getReposByOrg = async (orgLogin: string): Promise<Omit<Repository, 'runs'>[]> => {
    return db.all(`
        SELECT r.id, r.name, r.fullName, r.description 
        FROM repositories r
        JOIN organizations o ON r.organizationId = o.id
        WHERE o.login = ?
    `, orgLogin);
};

export const getRunsByRepo = async (owner: string, repoName: string): Promise<WorkflowRunSummary[]> => {
    const fullName = `${owner}/${repoName}`;
    return db.all(`
        SELECT w.id, w.name, w.status, w.branch, w.commit_hash as commit, w.duration_s as duration, w.created_at as createdAt
        FROM workflow_runs w
        JOIN repositories r ON w.repository_id = r.id
        WHERE r.fullName = ?
        ORDER BY w.created_at DESC
    `, fullName);
};

export const getRunDetails = async (runId: string): Promise<RunData | null> => {
    const run = await db.get('SELECT * FROM workflow_runs WHERE id = ?', runId);
    if (!run) return null;
    
    const logs = await db.all('SELECT timestamp, message FROM logs WHERE run_id = ? ORDER BY timestamp ASC', runId);
    const resources = await db.all('SELECT timestamp, cpu, memory, disk, networkIn, networkOut FROM resource_metrics WHERE run_id = ? ORDER BY timestamp ASC', runId);

    return {
        id: run.id,
        workflow: run.workflow_name,
        startTime: run.start_time,
        endTime: run.end_time,
        logs,
        resources,
        machineInfo: {
            os: run.machine_os,
            architecture: run.machine_arch,
        }
    };
};

export const getLastResourceMetric = async (runId: string): Promise<{timestamp: number, rawPayload: string} | null> => {
    return db.get('SELECT timestamp, rawPayload FROM resource_metrics WHERE run_id = ? ORDER BY timestamp DESC LIMIT 1', runId);
};

export const addResourceMetric = async (runId: string, metric: ResourceUsage & { rawPayload: string }) => {
    await db.run(
        'INSERT INTO resource_metrics (run_id, timestamp, cpu, memory, disk, networkIn, networkOut, rawPayload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        runId, metric.timestamp, metric.cpu, metric.memory, metric.disk, metric.networkIn, metric.networkOut, metric.rawPayload
    );
};

export const completeRunByGithubId = async (githubRunId: string, conclusion: string) => {
    const run = await db.get('SELECT * FROM workflow_runs WHERE github_run_id = ?', githubRunId);
    if (!run) {
        console.warn(`Run with GitHub ID ${githubRunId} not found.`);
        return;
    }

    const endTime = Date.now();
    const status = conclusion === 'success' ? 'success' : 'failure';
    const duration = Math.round((endTime - run.start_time) / 1000);

    await db.run('UPDATE workflow_runs SET status = ?, endTime = ?, duration_s = ? WHERE id = ?', status, endTime, duration, run.id);
    await db.run('INSERT INTO logs (run_id, timestamp, message) VALUES (?, ?, ?)', run.id, endTime, `Webhook received: Run finished with status '${status}'.`);
};


// --- SEEDING LOGIC ---
const generateRunData = (id: string, workflowName: string, scenario: 'normal' | 'high-mem' | 'fail-build') => {
  const startTime = Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24);
  const resources: ResourceUsage[] = [];
  const logs = [];
  let currentTime = startTime;

  const machineInfos: MachineInfo[] = [
    { os: 'Ubuntu 22.04.3 LTS', architecture: 'x64' },
    { os: 'macOS 14.1 Sonoma', architecture: 'arm64' },
    { os: 'Windows Server 2022', architecture: 'x64' },
  ];
  const machineInfo = machineInfos[Math.floor(Math.random() * machineInfos.length)];

  logs.push({ timestamp: currentTime, message: `Runner machine is starting up on ${machineInfo.os}...` });
  for (let i = 0; i < 5; i++) {
    currentTime += 1000;
    resources.push({
      timestamp: currentTime, cpu: 5 + Math.random() * 5, memory: 500 + Math.random() * 100, disk: 20 + Math.random(),
      networkIn: Math.random() * 0.5, networkOut: Math.random() * 0.1,
    });
  }
  currentTime += 1000;
  logs.push({ timestamp: currentTime, message: "Running 'npm install'..." });
  for (let i = 0; i < 15; i++) {
    currentTime += 1000;
    resources.push({
      timestamp: currentTime, cpu: 60 + Math.random() * 30, memory: 1200 + Math.random() * 300,
      disk: 21 + i * 0.2, networkIn: 5 + Math.random() * 5, networkOut: 1 + Math.random() * 0.5,
    });
  }
  logs.push({ timestamp: currentTime, message: "Finished 'npm install' in 15.2s" });
  currentTime += 1000;
  logs.push({ timestamp: currentTime, message: "Running 'npm run build'..." });
  if (scenario === 'fail-build') {
     for (let i = 0; i < 10; i++) {
        currentTime += 1000;
        resources.push({ timestamp: currentTime, cpu: 95, memory: 2000, disk: 25, networkIn: 0.1, networkOut: 0.1 });
     }
     logs.push({ timestamp: currentTime, message: "Error: Build failed with exit code 1" });
     return { id, workflow: workflowName, startTime, endTime: currentTime, logs, resources, machineInfo };
  }
  for (let i = 0; i < 20; i++) {
    currentTime += 1000;
    resources.push({ timestamp: currentTime, cpu: 90 + Math.random() * 10, memory: 2500, disk: 25, networkIn: 0.2, networkOut: 0.1 });
  }
  logs.push({ timestamp: currentTime, message: "Build successful." });
  const endTime = currentTime;
  return { id, workflow: workflowName, startTime, endTime, logs, resources, machineInfo };
};

const seedData = async () => {
    const orgs = [
        { id: 1, login: 'acme-corp', name: 'Acme Corporation', avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Acme` },
        { id: 2, login: 'dev-tools', name: 'Developer Tools', avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=DevTools`},
    ];
    for (const org of orgs) {
        await db.run('INSERT INTO organizations (id, login, name, avatarUrl) VALUES (?, ?, ?, ?)', org.id, org.login, org.name, org.avatarUrl);
    }
    
    const repos = [
        { id: 1, name: 'frontend-dashboard', fullName: 'acme-corp/frontend-dashboard', description: 'The main user-facing dashboard application.', organizationId: 1, workflowName: 'CI/CD Pipeline' },
        { id: 2, name: 'backend-api', fullName: 'acme-corp/backend-api', description: 'Handles all data processing and API requests.', organizationId: 1, workflowName: 'API Deployment' },
        { id: 3, name: 'design-system', fullName: 'dev-tools/design-system', description: 'A shared library of UI components.', organizationId: 2, workflowName: 'Component Library CI' },
    ];
    for (const repo of repos) {
        await db.run('INSERT INTO repositories (id, name, fullName, description, organizationId) VALUES (?, ?, ?, ?, ?)', repo.id, repo.name, repo.fullName, repo.description, repo.organizationId);
        
        const scenarios: ('normal' | 'high-mem' | 'fail-build')[] = ['normal', 'fail-build'];
        const names = ['feat: add new dashboard widget', 'fix: resolve memory leak in tests'];
        for (let i=0; i<scenarios.length; i++) {
            const id = `run-${repo.id}-${i}`;
            const data = generateRunData(id, repo.workflowName, scenarios[i]);
            const run = {
                id: id,
                github_run_id: `gh-run-${repo.id}-${i}`,
                name: names[i],
                status: scenarios[i] === 'fail-build' ? 'failure' as RunStatus : 'success' as RunStatus,
                branch: 'main',
                commit_hash: Math.random().toString(16).substring(2, 9),
                duration_s: Math.round((data.endTime - data.startTime) / 1000),
                created_at: Date.now() - (i * 1000 * 3600),
                start_time: data.startTime,
                end_time: data.endTime,
                workflow_name: data.workflow,
                machine_os: data.machineInfo.os,
                machine_arch: data.machineInfo.architecture,
                repository_id: repo.id,
            };
            await db.run(
                'INSERT INTO workflow_runs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                Object.values(run)
            );
            for (const log of data.logs) {
                await db.run('INSERT INTO logs (run_id, timestamp, message) VALUES (?, ?, ?)', run.id, log.timestamp, log.message);
            }
            for (const metric of data.resources) {
                await db.run('INSERT INTO resource_metrics (run_id, timestamp, cpu, memory, disk, networkIn, networkOut) VALUES (?, ?, ?, ?, ?, ?, ?)', run.id, metric.timestamp, metric.cpu, metric.memory, metric.disk, metric.networkIn, metric.networkOut);
            }
        }
    }
};
