import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowRun, Job, JobDetail, MetricChartData } from '@/types';
import { api } from '@/services/api';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import CpuChart from '@/components/charts/CpuChart';
import MemoryChart from '@/components/charts/MemoryChart';
import DiskChart from '@/components/charts/DiskChart';
import LogViewer from '@/components/LogViewer';
import GeminiAnalysisView from '@/components/GeminiAnalysisView';
import { Loader2 } from 'lucide-react';

interface JobDetailPageProps {
  workflowRun: WorkflowRun;
  onBack: () => void;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ workflowRun, onBack }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await api.getJobsForRun(workflowRun.id.toString());
        setJobs(data);
        setError(null);
        
        // Auto-select the first job if available
        if (data.length > 0) {
          handleSelectJob(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [workflowRun]);

  const handleSelectJob = async (jobId: number) => {
    try {
      setLoadingDetail(true);
      const detail = await api.getJobDetail(jobId);
      setSelectedJob(detail);
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatMetricsForChart = (detail: JobDetail): MetricChartData[] => {
    return detail.metrics.map((m) => ({
      timestamp: new Date(m.timestamp).getTime(),
      cpu: m.cpuUsagePercent || 0,
      memory: m.memoryUsagePercent || 0,
      disk: m.diskUsagePercent || 0,
    }));
  };

  const getStatusVariant = (conclusion: string | null): 'success' | 'destructive' | 'warning' => {
    if (conclusion === 'success') return 'success';
    if (conclusion === 'failure') return 'destructive';
    return 'warning';
  };

  const sidebar = (
    <Sidebar title="Jobs" onBack={onBack}>
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleSelectJob(job.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                selectedJob?.id === job.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <p className="font-medium text-sm truncate mb-1">{job.name}</p>
              <Badge variant={getStatusVariant(job.conclusion)}>
                {job.conclusion || job.status}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </Sidebar>
  );

  if (loading) {
    return (
      <Layout sidebar={sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
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

  if (jobs.length === 0) {
    return (
      <Layout sidebar={sidebar}>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          No jobs found for this workflow run.
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{workflowRun.name}</h1>
          <p className="text-muted-foreground mt-2">
            Job details and resource metrics
          </p>
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading job details...</p>
            </div>
          </div>
        ) : selectedJob ? (
          <div className="space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(selectedJob.conclusion)} className="mt-1">
                      {selectedJob.conclusion || selectedJob.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Started At</p>
                    <p className="text-sm mt-1">
                      {selectedJob.startedAt
                        ? new Date(selectedJob.startedAt).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                    <p className="text-sm mt-1">
                      {selectedJob.completedAt
                        ? new Date(selectedJob.completedAt).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Branch</p>
                    <p className="text-sm mt-1">{selectedJob.branch || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Metrics - Separate Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <CpuChart data={formatMetricsForChart(selectedJob)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <MemoryChart data={formatMetricsForChart(selectedJob)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disk Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <DiskChart data={formatMetricsForChart(selectedJob)} />
                </CardContent>
              </Card>
            </div>

            {/* Logs and AI Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <LogViewer logUrl={selectedJob.logUrl} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeminiAnalysisView jobId={selectedJob.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            Select a job to view details
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobDetailPage;
