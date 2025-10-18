import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Repository, WorkflowRun } from '@/types';
import { api } from '@/services/api';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

interface WorkflowRunListPageProps {
  repository: Repository;
  onSelectRun: (run: WorkflowRun) => void;
  onBack: () => void;
}

const WorkflowRunListPage: React.FC<WorkflowRunListPageProps> = ({
  repository,
  onSelectRun,
  onBack,
}) => {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const data = await api.getWorkflowRuns(repository.owner, repository.name);
        setRuns(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow runs');
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [repository]);

  const getStatusVariant = (status: string, conclusion: string | null): 'success' | 'destructive' | 'warning' | 'secondary' => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'success';
      if (conclusion === 'failure') return 'destructive';
      if (conclusion === 'cancelled') return 'secondary';
    }
    if (status === 'in_progress') return 'warning';
    return 'secondary';
  };

  const sidebar = (
    <Sidebar title="Navigation" onBack={onBack}>
      <div className="px-2 py-2">
        <p className="text-sm font-medium">Repository</p>
        <p className="text-sm text-muted-foreground mt-1">{repository.fullName}</p>
      </div>
    </Sidebar>
  );

  if (loading) {
    return (
      <Layout sidebar={sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading workflow runs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebar={sidebar}>
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Runs</h1>
          <p className="text-muted-foreground mt-2">
            Select a workflow run to view job details and metrics
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Commit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSelectRun(run)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {run.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getStatusVariant(run.status, run.conclusion)}>
                        {run.conclusion || run.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {run.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {run.commit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkflowRunListPage;
