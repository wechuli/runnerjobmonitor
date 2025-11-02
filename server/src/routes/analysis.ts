import { Router, Request, Response } from "express";
import { JobMetrics, IJobMetrics } from "../models/JobMetrics";

const router = Router();

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  insights: Array<{
    metric: string;
    observation: string;
    severity: "low" | "medium" | "high";
  }>;
}

/**
 * POST /api/analyze/:job_uuid
 * Analyze metrics for a specific job and provide AI-powered insights
 */
router.post("/:job_uuid", async (req: Request, res: Response) => {
  try {
    const { job_uuid } = req.params;

    // Fetch metrics from database
    const metrics = await JobMetrics.find({ job_uuid })
      .sort({ timestamp: -1 })
      .lean<IJobMetrics[]>();

    if (!metrics || metrics.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No metrics found for this job UUID",
      });
    }

    // Calculate statistics
    const cpuUsages = metrics.map(
      (m: IJobMetrics) => m.system.cpu.current_usage.usage_percent
    );
    const memUsages = metrics.map(
      (m: IJobMetrics) => m.system.memory.usage_percent
    );
    const diskUsages = metrics.map(
      (m: IJobMetrics) => m.system.disk[0]?.use_percentage || 0
    );

    const avgCpu =
      cpuUsages.reduce((a: number, b: number) => a + b, 0) / cpuUsages.length;
    const maxCpu = Math.max(...cpuUsages);
    const minCpu = Math.min(...cpuUsages);

    const avgMem =
      memUsages.reduce((a: number, b: number) => a + b, 0) / memUsages.length;
    const maxMem = Math.max(...memUsages);

    const avgDisk =
      diskUsages.reduce((a: number, b: number) => a + b, 0) / diskUsages.length;

    // Generate analysis
    const insights: AnalysisResult["insights"] = [];
    const recommendations: string[] = [];

    // CPU Analysis
    if (maxCpu > 90) {
      insights.push({
        metric: "CPU Usage",
        observation: `Peak CPU usage reached ${maxCpu.toFixed(
          1
        )}%, indicating intensive computational work. Average CPU usage was ${avgCpu.toFixed(
          1
        )}%.`,
        severity: "high",
      });
      recommendations.push(
        "Consider upgrading to a runner with more CPU cores for compute-intensive workflows"
      );
    } else if (maxCpu > 70) {
      insights.push({
        metric: "CPU Usage",
        observation: `Moderate CPU usage observed with peaks at ${maxCpu.toFixed(
          1
        )}%. Average usage was ${avgCpu.toFixed(1)}%.`,
        severity: "medium",
      });
      recommendations.push(
        "CPU usage is healthy but monitor for trends over time"
      );
    } else {
      insights.push({
        metric: "CPU Usage",
        observation: `CPU usage remained low with an average of ${avgCpu.toFixed(
          1
        )}% and peak of ${maxCpu.toFixed(1)}%.`,
        severity: "low",
      });
    }

    // Memory Analysis
    if (maxMem > 85) {
      insights.push({
        metric: "Memory Usage",
        observation: `Memory usage reached ${maxMem.toFixed(
          1
        )}%, which is approaching critical levels. Average usage was ${avgMem.toFixed(
          1
        )}%.`,
        severity: "high",
      });
      recommendations.push(
        "Consider optimizing memory usage or upgrading to a runner with more RAM"
      );
      recommendations.push(
        "Review application for potential memory leaks or inefficient memory allocation"
      );
    } else if (maxMem > 70) {
      insights.push({
        metric: "Memory Usage",
        observation: `Memory usage was moderate with peaks at ${maxMem.toFixed(
          1
        )}% and average of ${avgMem.toFixed(1)}%.`,
        severity: "medium",
      });
      recommendations.push(
        "Memory usage is acceptable but could benefit from optimization"
      );
    } else {
      insights.push({
        metric: "Memory Usage",
        observation: `Memory usage remained healthy with an average of ${avgMem.toFixed(
          1
        )}% and peak of ${maxMem.toFixed(1)}%.`,
        severity: "low",
      });
    }

    // Disk Analysis
    if (avgDisk > 85) {
      insights.push({
        metric: "Disk Usage",
        observation: `Disk usage is high at ${avgDisk.toFixed(
          1
        )}%, which may impact performance and leave little room for temporary files.`,
        severity: "high",
      });
      recommendations.push(
        "Clean up unnecessary files or increase disk space allocation"
      );
    } else if (avgDisk > 70) {
      insights.push({
        metric: "Disk Usage",
        observation: `Disk usage is at ${avgDisk.toFixed(
          1
        )}%, approaching high levels.`,
        severity: "medium",
      });
      recommendations.push("Monitor disk usage and plan for cleanup if needed");
    } else {
      insights.push({
        metric: "Disk Usage",
        observation: `Disk usage is healthy at ${avgDisk.toFixed(
          1
        )}% with adequate free space available.`,
        severity: "low",
      });
    }

    // Duration Analysis
    const duration = metrics.length * 15; // Assuming 15-second intervals
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;

    insights.push({
      metric: "Execution Time",
      observation: `Job ran for approximately ${durationMinutes}m ${durationSeconds}s with ${metrics.length} data points collected.`,
      severity: "low",
    });

    // Performance trends
    const firstHalfCpu =
      cpuUsages
        .slice(0, Math.floor(cpuUsages.length / 2))
        .reduce((a: number, b: number) => a + b, 0) /
      Math.floor(cpuUsages.length / 2);
    const secondHalfCpu =
      cpuUsages
        .slice(Math.floor(cpuUsages.length / 2))
        .reduce((a: number, b: number) => a + b, 0) /
      (cpuUsages.length - Math.floor(cpuUsages.length / 2));

    if (secondHalfCpu > firstHalfCpu * 1.5) {
      recommendations.push(
        "CPU usage increased significantly during execution. Consider parallelizing tasks or optimizing late-stage operations"
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "Your job execution looks healthy! No major optimizations needed at this time."
      );
    }

    recommendations.push(
      "Continue monitoring metrics over time to identify trends and patterns"
    );

    // Generate summary
    const summary =
      `The job executed successfully with ${metrics.length} data points collected over approximately ${durationMinutes} minutes. ` +
      `Average resource utilization: CPU ${avgCpu.toFixed(
        1
      )}%, Memory ${avgMem.toFixed(1)}%, Disk ${avgDisk.toFixed(1)}%. ` +
      (maxCpu > 80 || maxMem > 80
        ? "High resource usage was observed during execution, which may indicate optimization opportunities."
        : "Resource usage remained within healthy limits throughout execution.");

    const analysis: AnalysisResult = {
      summary,
      insights,
      recommendations,
    };

    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze metrics",
    });
  }
});

export default router;
