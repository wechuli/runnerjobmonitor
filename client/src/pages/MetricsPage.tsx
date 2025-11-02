import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CpuChart } from "@/components/charts/CpuChart";
import { MemoryChart } from "@/components/charts/MemoryChart";
import { DiskChart } from "@/components/charts/DiskChart";
import { ProcessTable } from "@/components/charts/ProcessTable";
import { analyzeMetrics } from "@/services/api";

interface TopProcess {
  pid: number;
  cpu: number;
  mem: number;
  command: string;
  user?: string;
}

interface CPU {
  cores: number;
  model?: string;
  load?: {
    avg_1min: number;
    avg_5min: number;
    avg_15min: number;
  };
  current_usage: {
    usage_percent: number;
  };
}

interface Memory {
  total_bytes: number;
  used_bytes: number;
  free_bytes?: number;
  available_bytes?: number;
  usage_percent: number;
}

interface Disk {
  filesystem: string;
  size_bytes: number;
  used_bytes: number;
  available_bytes: number;
  use_percentage: number;
  mounted_on?: string;
}

interface Network {
  interface: string;
  state?: string;
  stats?: {
    rx_bytes: number;
    tx_bytes: number;
  };
}

interface SystemInfo {
  hostname: string;
  kernel?: string;
  uptime_seconds: number;
}

interface System {
  info: SystemInfo;
  cpu: CPU;
  memory: Memory;
  disk: Disk[];
  network?: Network[];
  top_processes: TopProcess[];
}

interface Repository {
  name: string;
  owner: string;
  url: string;
}

interface GithubContext {
  user: string;
  repositories: Repository[];
}

interface JobMetric {
  timestamp: string;
  job_uuid: string;
  github_context: GithubContext;
  system: System;
}

interface MetricsResponse {
  success: boolean;
  count: number;
  data: JobMetric[];
}

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  insights: Array<{
    metric: string;
    observation: string;
    severity: "low" | "medium" | "high";
  }>;
}

export const MetricsPage = () => {
  const { jobUuid } = useParams<{ jobUuid: string }>();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<JobMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!jobUuid) return;

      try {
        const response = await fetch(
          `http://localhost:8080/api/metrics/${jobUuid}`
        );
        const data: MetricsResponse = await response.json();

        console.log("Fetched metrics response:", data);
        console.log("First metric sample:", data.data[0]);

        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch metrics");
        }

        if (data.count === 0) {
          setError("No metrics found for this job UUID");
          return;
        }

        setMetrics(data.data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setError("Failed to load metrics. Please try again.");
        toast.error("Failed to load metrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [jobUuid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || metrics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "No metrics available"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const latestMetric = metrics[0];
  const { github_context, system } = latestMetric;

  // Transform metrics to match chart component expectations
  const transformedMetrics = metrics.map((metric) => ({
    timestamp: metric.timestamp,
    github_context: {
      job_id: 0, // Not available in new structure
      run_id: 0, // Not available in new structure
      user: metric.github_context.user,
      repository: metric.github_context.repositories[0]?.name || "",
    },
    system: metric.system,
  }));

  // Generate mock logs from metrics for preview
  const generateLogsPreview = () => {
    const logs: string[] = [];
    logs.push(`[INFO] Job UUID: ${jobUuid}`);
    logs.push(`[INFO] Runner: ${system.info.hostname}`);
    if (system.info.kernel) {
      logs.push(`[INFO] Kernel: ${system.info.kernel}`);
    }
    logs.push(`[INFO] CPU Cores: ${system.cpu.cores}`);
    logs.push(
      `[INFO] Total Memory: ${(
        system.memory.total_bytes /
        1024 /
        1024 /
        1024
      ).toFixed(2)} GB`
    );
    logs.push(`[INFO] Collecting metrics...`);

    // Sample some metrics
    const samples = [0, Math.floor(metrics.length / 2), metrics.length - 1];
    samples.forEach((idx) => {
      if (metrics[idx]) {
        const m = metrics[idx];
        logs.push(
          `[METRICS ${
            m.timestamp
          }] CPU: ${m.system.cpu.current_usage.usage_percent.toFixed(
            1
          )}%, Memory: ${m.system.memory.usage_percent.toFixed(1)}%, Disk: ${
            m.system.disk[0]?.use_percentage || 0
          }%`
        );
      }
    });

    logs.push(`[INFO] Metrics collection completed`);
    logs.push(`[INFO] Total data points: ${metrics.length}`);

    return logs.join("\n");
  };

  const handleAnalyze = async () => {
    if (!jobUuid) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeMetrics(jobUuid);
      setAnalysis(result);
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Error analyzing metrics:", error);
      toast.error("Failed to analyze metrics. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Job Metrics</h1>
            <p className="text-muted-foreground">UUID: {jobUuid}</p>
          </div>
        </div>

        {/* Job Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
            <CardDescription>GitHub context and system details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User
                </p>
                <p className="text-lg font-mono">{github_context.user}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Repository
                </p>
                <p className="text-lg font-mono">
                  {github_context.repositories[0]?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Hostname
                </p>
                <p className="text-lg font-mono">{system.info.hostname}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data Points
                </p>
                <p className="text-lg">{metrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Charts */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CPU Usage</CardTitle>
                <CardDescription className="text-xs">
                  CPU utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CpuChart data={transformedMetrics} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Memory Usage</CardTitle>
                <CardDescription className="text-xs">
                  Hover over chart for GB values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemoryChart data={transformedMetrics} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Disk Usage</CardTitle>
                <CardDescription className="text-xs">
                  Hover over chart for GB values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiskChart data={transformedMetrics} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Processes & Logs */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Processes</CardTitle>
                <CardDescription className="text-xs">
                  Resource-intensive processes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProcessTable data={transformedMetrics} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Logs Preview</CardTitle>
                <CardDescription className="text-xs">
                  Summary of job execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] bg-muted p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto font-mono leading-relaxed">
                  {generateLogsPreview()}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Analysis Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Get AI-powered insights about your job performance
                </CardDescription>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!analysis && !isAnalyzing && (
              <div className="text-center py-8 text-muted-foreground">
                Click "Analyze with AI" to get intelligent insights about your
                job metrics
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>

                {/* Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
                  <div className="space-y-3">
                    {analysis.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{insight.metric}</span>
                          <Badge variant={getSeverityColor(insight.severity)}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.observation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
