import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWorkflowRuns } from '@/services/api';
import type { WorkflowRun } from '@/types';
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
import { PlayCircle, CheckCircle, XCircle, Clock, GitBranch } from '@phosphor-icons/react';

export const WorkflowRunsPage = () => {
  const { org, repo } = useParams<{ org: string; repo: string }>();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRuns = async () => {
      if (!org || !repo) return;
      try {
        const data = await fetchWorkflowRuns(org, repo);
        setRuns(data);
      } catch (error) {
        console.error('Failed to fetch workflow runs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRuns();
  }, [org, repo]);

  const getStatusIcon = (run: WorkflowRun) => {
    if (run.status === 'in_progress') {
      return <Clock size={20} className="text-accent animate-pulse" />;
    }
    if (run.conclusion === 'success') {
      return <CheckCircle size={20} weight="fill" className="text-chart-2" />;
    }
    if (run.conclusion === 'failure') {
      return <XCircle size={20} weight="fill" className="text-destructive" />;
    }
    return <PlayCircle size={20} className="text-muted-foreground" />;
  };

  const getStatusBadge = (run: WorkflowRun) => {
    if (run.status === 'in_progress') {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    if (run.conclusion === 'success') {
      return <Badge className="bg-chart-2 text-white hover:bg-chart-2">Success</Badge>;
    }
    if (run.conclusion === 'failure') {
      return <Badge variant="destructive">Failure</Badge>;
    }
    return <Badge variant="outline">{run.status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
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
              <BreadcrumbPage>{repo}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2 className="text-3xl font-semibold text-foreground mb-6 tracking-tight">
          Workflow Runs
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-6 w-2/3 mb-2" />
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
            <BreadcrumbPage>{repo}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Workflow Runs
        </h2>
        <p className="text-muted-foreground">
          Select a workflow run to view its jobs and metrics
        </p>
      </div>

      <div className="space-y-3">
        {runs.map((run) => (
          <Card
            key={run.id}
            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-200"
            onClick={() => navigate(`/orgs/${org}/repos/${repo}/runs/${run.id}/jobs`)}
          >
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(run)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">
                      {run.name}
                    </h3>
                    {getStatusBadge(run)}
                    <Badge variant="outline" className="font-mono text-xs">
                      #{run.run_number}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <GitBranch size={16} />
                      <span className="font-mono">{run.head_branch}</span>
                    </div>
                    <span>•</span>
                    <span>{run.event}</span>
                    <span>•</span>
                    <span>by {run.actor}</span>
                    <span>•</span>
                    <span>{formatDate(run.created_at)}</span>
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
