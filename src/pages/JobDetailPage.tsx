import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJobDetails, analyzeJob } from '@/services/api';
import type { JobDetails, AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CpuChart } from '@/components/charts/CpuChart';
import { MemoryChart } from '@/components/charts/MemoryChart';
import { DiskChart } from '@/components/charts/DiskChart';
import { ProcessChart } from '@/components/charts/ProcessChart';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock,
  Cpu,
  Database,
  HardDrive,
  Activity,
  Lightbulb,
  Warning
} from '@phosphor-icons/react';

export const JobDetailPage = () => {
  const { org, repo, runId, jobId } = useParams<{
    org: string;
    repo: string;
    runId: string;
    jobId: string;
  }>();
  
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) return;
      try {
        const data = await fetchJobDetails(Number(jobId));
        setJobDetails(data);
      } catch (error) {
        console.error('Failed to fetch job details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]);

  const handleAnalyze = async () => {
    if (!jobId) return;
    setAnalyzing(true);
    try {
      const result = await analyzeJob(Number(jobId));
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze job:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusIcon = () => {
    if (!jobDetails) return null;
    const { job } = jobDetails;
    
    if (job.status === 'in_progress') {
      return <Clock size={24} className="text-accent animate-pulse" />;
    }
    if (job.conclusion === 'success') {
      return <CheckCircle size={24} weight="fill" className="text-chart-2" />;
    }
    if (job.conclusion === 'failure') {
      return <XCircle size={24} weight="fill" className="text-destructive" />;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (!jobDetails) return null;
    const { job } = jobDetails;
    
    if (job.status === 'in_progress') {
      return <Badge variant="secondary" className="text-base px-3 py-1">In Progress</Badge>;
    }
    if (job.conclusion === 'success') {
      return <Badge className="bg-chart-2 text-white hover:bg-chart-2 text-base px-3 py-1">Success</Badge>;
    }
    if (job.conclusion === 'failure') {
      return <Badge variant="destructive" className="text-base px-3 py-1">Failure</Badge>;
    }
    return null;
  };

  const getDuration = () => {
    if (!jobDetails) return '';
    const { job } = jobDetails;
    const start = new Date(job.started_at);
    const end = job.completed_at ? new Date(job.completed_at) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-chart-3';
      case 'low':
        return 'text-chart-2';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Warning size={20} weight="fill" className="text-destructive" />;
      case 'medium':
        return <Warning size={20} className="text-chart-3" />;
      case 'low':
        return <Lightbulb size={20} className="text-chart-2" />;
      default:
        return <Lightbulb size={20} className="text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Organizations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/orgs/${org}/repos`}>{org}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/orgs/${org}/repos/${repo}/runs`}>
                {repo}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/orgs/${org}/repos/${repo}/runs/${runId}/jobs`}>
                Run #{runId}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Job {jobId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return <div>Job not found</div>;
  }

  const { job, metrics, logs } = jobDetails;

  return (
    <div>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/orgs/${org}/repos`}>{org}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/orgs/${org}/repos/${repo}/runs`}>
              {repo}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/orgs/${org}/repos/${repo}/runs/${runId}/jobs`}>
              Run #{runId}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon()}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{job.name}</CardTitle>
                  {getStatusBadge()}
                </div>
                <CardDescription className="text-base">
                  Runner: {job.runner_name} • Duration: {getDuration()} • Job ID: {job.id}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="gap-2"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Clock size={20} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={20} weight="fill" />
                  Analyze Job
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {analysis && (
        <Card className="mb-6 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain size={24} weight="fill" className="text-accent" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Key Insights</h4>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="mt-0.5">{getSeverityIcon(insight.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {insight.metric}
                        </span>
                        <Badge
                          variant="outline"
                          className={getSeverityColor(insight.severity)}
                        >
                          {insight.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.observation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Lightbulb
                      size={16}
                      weight="fill"
                      className="text-accent mt-0.5 flex-shrink-0"
                    />
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu size={20} className="text-chart-1" />
              CPU Usage
            </CardTitle>
            <CardDescription>Processor utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <CpuChart data={metrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} className="text-chart-2" />
              Memory Usage
            </CardTitle>
            <CardDescription>RAM consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <MemoryChart data={metrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive size={20} className="text-chart-3" />
              Disk Usage
            </CardTitle>
            <CardDescription>Storage utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <DiskChart data={metrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} className="text-chart-4" />
              Top Process Metrics
            </CardTitle>
            <CardDescription>Primary process resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ProcessChart data={metrics} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Logs</CardTitle>
          <CardDescription>Complete execution log output</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
              {logs}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
