import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWorkflowJobs } from '@/services/api';
import type { WorkflowJob } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { HardDrives, CheckCircle, XCircle, Clock } from '@phosphor-icons/react';

export const JobsPage = () => {
  const { org, repo, runId } = useParams<{ org: string; repo: string; runId: string }>();
  const [jobs, setJobs] = useState<WorkflowJob[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      if (!runId) return;
      try {
        const data = await fetchWorkflowJobs(Number(runId));
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [runId]);

  const getStatusIcon = (job: WorkflowJob) => {
    if (job.status === 'in_progress') {
      return <Clock size={20} className="text-accent animate-pulse" />;
    }
    if (job.conclusion === 'success') {
      return <CheckCircle size={20} weight="fill" className="text-chart-2" />;
    }
    if (job.conclusion === 'failure') {
      return <XCircle size={20} weight="fill" className="text-destructive" />;
    }
    return <HardDrives size={20} className="text-muted-foreground" />;
  };

  const getStatusBadge = (job: WorkflowJob) => {
    if (job.status === 'in_progress') {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    if (job.conclusion === 'success') {
      return <Badge className="bg-chart-2 text-white hover:bg-chart-2">Success</Badge>;
    }
    if (job.conclusion === 'failure') {
      return <Badge variant="destructive">Failure</Badge>;
    }
    return <Badge variant="outline">{job.status}</Badge>;
  };

  const getDuration = (job: WorkflowJob) => {
    const start = new Date(job.started_at);
    const end = job.completed_at ? new Date(job.completed_at) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
              <BreadcrumbPage>Run #{runId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2 className="text-3xl font-semibold text-foreground mb-6 tracking-tight">
          Jobs
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            <BreadcrumbPage>Run #{runId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Jobs
        </h2>
        <p className="text-muted-foreground">
          Select a job to view detailed metrics and analysis
        </p>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-200"
            onClick={() =>
              navigate(`/orgs/${org}/repos/${repo}/runs/${runId}/jobs/${job.id}`)
            }
          >
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(job)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.name}
                    </h3>
                    {getStatusBadge(job)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <HardDrives size={16} />
                      <span>{job.runner_name}</span>
                    </div>
                    <span>•</span>
                    <span>Duration: {getDuration(job)}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">Job ID: {job.id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
