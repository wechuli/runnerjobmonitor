
import React, { useState, useEffect } from 'react';
import type { RunData, WorkflowRunSummary } from '../types';
import ResourceChart from './ResourceChart';
import LogViewer from './LogViewer';
import AnalysisPanel from './AnalysisPanel';

interface DashboardProps {
  runSummary: WorkflowRunSummary;
  onBackToRuns: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ runSummary, onBackToRuns }) => {
  const [runData, setRunData] = useState<RunData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const fetchRunData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/runs/${runSummary.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch run data');
        }
        const data: RunData = await response.json();
        setRunData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRunData();
  }, [runSummary.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
        <p className="ml-4 text-xl">Loading Run Details...</p>
      </div>
    );
  }

  if (error || !runData) {
    return <div className="p-4 bg-error/20 text-error rounded-lg text-center">Error: {error || 'Could not load run data.'}</div>;
  }
  
  const totalDuration = (runData.endTime - runData.startTime) / 1000;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 bg-secondary rounded-xl shadow-lg border border-slate-700">
        <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral">Workflow Run Analysis</h2>
              <p className="text-slate-300">Run ID: <span className="font-mono bg-base-100 px-2 py-1 rounded">{runData.id}</span></p>
              <p className="text-slate-300">Workflow: <span className="font-semibold text-white">{runData.workflow}</span></p>
              <p className="text-slate-300">Total Duration: <span className="font-semibold text-white">{totalDuration.toFixed(2)} seconds</span></p>
            </div>
            <button 
              onClick={onBackToRuns}
              className="bg-accent hover:bg-info text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              &larr; Back to Runs
            </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-300 text-sm">
            <div className="flex items-center gap-2" title="Operating System">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Runner OS:</span>
                <span>{runData.machineInfo.os}</span>
            </div>
            <div className="flex items-center gap-2" title="CPU Architecture">
                <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                <span className="font-medium">Architecture:</span>
                <span>{runData.machineInfo.architecture}</span>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-secondary rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-center">Resource Usage Breakdown</h3>
            <ResourceChart data={runData.resources} onHover={setActiveTimestamp} />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Correlated Logs</h3>
                <LogViewer logs={runData.logs} activeTimestamp={activeTimestamp} />
            </div>
            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-slate-700">
                <AnalysisPanel runData={runData} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
