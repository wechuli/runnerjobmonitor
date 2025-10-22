import { GoogleGenerativeAI } from '@google/generative-ai';
import { MetricData } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    } else {
      console.warn('GEMINI_API_KEY not set. AI analysis will be disabled.');
    }
  }

  async analyzeJob(
    jobName: string,
    workflowName: string,
    metrics: MetricData[],
    logs: string
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Format metrics for the prompt
    const metricsSummary = this.formatMetrics(metrics);
    
    // Truncate logs if too long (keep first and last portions)
    const truncatedLogs = this.truncateLogs(logs, 5000);

    const prompt = `
You are an expert DevOps engineer specializing in GitHub Actions performance optimization.

Analyze the following GitHub Actions job data and provide actionable insights.

**Job Information:**
- Job Name: ${jobName}
- Workflow: ${workflowName}

**System Metrics Over Time:**
${metricsSummary}

**Job Logs (excerpt):**
\`\`\`
${truncatedLogs}
\`\`\`

**Your Task:**
1. **Performance Summary**: Provide an overview of the job's performance
2. **Bottlenecks Identified**: Identify any performance bottlenecks such as:
   - CPU spikes or sustained high CPU usage
   - Memory pressure or out-of-memory risks
   - Disk I/O limitations
   - Network bottlenecks
3. **Correlation Analysis**: Correlate high resource usage with specific log entries or workflow steps
4. **Recommendations**: Provide specific, actionable recommendations such as:
   - Adjusting runner machine size (e.g., "Consider upgrading to a larger runner")
   - Optimizing workflow steps
   - Caching strategies
   - Parallelization opportunities

Format your response in markdown with clear sections using ### for headings.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to analyze job with Gemini');
    }
  }

  private formatMetrics(metrics: MetricData[]): string {
    if (metrics.length === 0) {
      return 'No metrics available';
    }

    // Sample metrics if there are too many (keep first, middle, and last)
    const sampledMetrics = this.sampleMetrics(metrics, 50);

    const formatted = sampledMetrics.map((m) => {
      const timestamp = m.timestamp.toISOString();
      const cpu = m.cpuUsagePercent?.toFixed(1) || 'N/A';
      const memPercent = m.memoryUsagePercent?.toFixed(1) || 'N/A';
      const memUsedMB = m.memoryUsedBytes
        ? (Number(m.memoryUsedBytes) / 1024 / 1024).toFixed(0)
        : 'N/A';
      const disk = m.diskUsagePercent?.toFixed(1) || 'N/A';

      return `[${timestamp}] CPU: ${cpu}%, Memory: ${memUsedMB}MB (${memPercent}%), Disk: ${disk}%`;
    });

    if (metrics.length > sampledMetrics.length) {
      formatted.push(`\n... (${metrics.length - sampledMetrics.length} more metrics omitted for brevity)`);
    }

    return formatted.join('\n');
  }

  private sampleMetrics(metrics: MetricData[], maxCount: number): MetricData[] {
    if (metrics.length <= maxCount) {
      return metrics;
    }

    const step = Math.floor(metrics.length / maxCount);
    const sampled: MetricData[] = [];

    for (let i = 0; i < metrics.length; i += step) {
      sampled.push(metrics[i]);
      if (sampled.length >= maxCount - 1) break;
    }

    // Always include the last metric
    sampled.push(metrics[metrics.length - 1]);

    return sampled;
  }

  private truncateLogs(logs: string, maxLength: number): string {
    if (logs.length <= maxLength) {
      return logs;
    }

    const halfLength = Math.floor(maxLength / 2);
    const start = logs.substring(0, halfLength);
    const end = logs.substring(logs.length - halfLength);

    return `${start}\n\n... (logs truncated for brevity) ...\n\n${end}`;
  }
}
