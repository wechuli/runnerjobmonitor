
import { GoogleGenAI } from "@google/genai";
import type { RunData, LogEntry, ResourceUsage } from '../types';

const formatForPrompt = <T,>(items: T[], formatter: (item: T) => string, limit = 50): string => {
  if (items.length <= limit) {
    return items.map(formatter).join('\n');
  }
  const start = items.slice(0, limit / 2);
  const end = items.slice(-limit / 2);
  return `${start.map(formatter).join('\n')}\n...\n(logs truncated)\n...\n${end.map(formatter).join('\n')}`;
};


export const analyzeRun = async (runData: RunData): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const resourceSummary = formatForPrompt(
    runData.resources,
    (r: ResourceUsage) => `T+${((r.timestamp - runData.startTime)/1000).toFixed(1)}s: CPU ${r.cpu.toFixed(1)}%, Mem ${r.memory.toFixed(0)}MB, Disk ${r.disk.toFixed(1)}%`,
    100
  );

  const logSummary = formatForPrompt(
    runData.logs,
    (l: LogEntry) => `T+${((l.timestamp - runData.startTime)/1000).toFixed(1)}s: ${l.message}`,
    100
  );

  const prompt = `
    You are an expert DevOps engineer specializing in GitHub Actions performance optimization.
    Analyze the following GitHub Actions run data for workflow "${runData.workflow}".
    The data includes resource usage metrics (CPU %, Memory MB, Disk %) and console logs, both with timestamps relative to the start of the run.

    Your task is to:
    1.  Identify any potential performance bottlenecks, such as CPU spikes, high memory consumption, or disk I/O limitations.
    2.  Correlate high resource usage with specific log entries or phases of the run (e.g., "CPU usage peaked during the 'npm install' step").
    3.  Provide actionable recommendations to optimize the runner's resource allocation or workflow steps. For example, if memory usage is consistently low, recommend reducing the allocated memory. If a specific step is slow and resource-intensive, suggest potential improvements for that step.
    4.  Summarize the overall performance of the run.

    Provide your analysis in a clear, structured format using markdown. Use headings like '### Performance Summary', '### Bottlenecks Identified', and '### Recommendations'.

    **Resource Metrics (Timestamp, CPU %, Memory MB, Disk %):**
    ${resourceSummary}

    **Logs (Timestamp, Message):**
    ${logSummary}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};
