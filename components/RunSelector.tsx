
import React, { useState, useEffect } from 'react';
import type { Repository, WorkflowRunSummary, RunStatus } from '../types';

interface RunSelectorProps {
  repository: Repository;
  onSelectRun: (run: WorkflowRunSummary) => void;
  onBack: () => void;
}

const StatusIcon: React.FC<{ status: RunStatus }> = ({ status }) => {
    switch(status) {
        case 'success':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'failure':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        default:
             return (
                <div className="h-5 w-5 flex items-center justify-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
            );
    }
}

const RunSelector: React.FC<RunSelectorProps> = ({ repository, onSelectRun, onBack }) => {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repository) return;
    const fetchRuns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/repos/${repository.fullName}/runs`);
        if (!response.ok) {
          throw new Error(`Failed to fetch runs for ${repository.fullName}`);
        }
        const data = await response.json();
        setRuns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRuns();
  }, [repository]);
  
  return (
    <div className="animate-fade-in bg-secondary p-6 rounded-xl shadow-lg border border-slate-700">
        <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-3xl font-bold text-neutral">Workflow Runs</h2>
                 <p className="text-slate-300">Repository: <span className="font-semibold text-white">{repository.fullName}</span></p>
            </div>
            <button onClick={onBack} className="bg-primary hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">&larr; Back to Repositories</button>
        </div>
      
      {isLoading && <div className="text-center p-10">Loading runs...</div>}
      {error && <div className="p-4 bg-error/20 text-error rounded-lg text-center">Error: {error}</div>}
      
      {!isLoading && !error && (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              onClick={() => onSelectRun(run)}
              className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,auto,auto] items-center gap-4 p-4 bg-base-100 rounded-lg shadow cursor-pointer hover:bg-primary transition-colors border border-transparent hover:border-accent"
            >
              <div className="flex items-center">
                  <StatusIcon status={run.status} />
              </div>
              <div>
                  <p className="font-bold text-neutral">{run.name}</p>
                  <p className="text-sm text-slate-400">
                      <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{run.commit}</span> on <span className="font-semibold text-accent/80">{run.branch}</span>
                  </p>
              </div>
              <div className="text-sm text-slate-300 text-right hidden md:block">
                  <p>{run.duration}s duration</p>
                  <p className="text-slate-400">{new Date(run.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RunSelector;
