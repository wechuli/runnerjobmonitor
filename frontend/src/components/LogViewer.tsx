import React from 'react';

interface LogViewerProps {
  logUrl: string | null;
}

const LogViewer: React.FC<LogViewerProps> = ({ logUrl }) => {
  if (!logUrl) {
    return (
      <div className="bg-slate-900 p-4 rounded-md font-mono text-sm text-slate-400 h-[400px] overflow-y-auto">
        <p>No logs available yet. Logs will be uploaded when the job completes.</p>
      </div>
    );
  }

  return (
    <div>
      <a 
        href={logUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline mb-2 block"
      >
        View Full Logs in GCP Storage
      </a>
      <div className="bg-slate-900 p-4 rounded-md font-mono text-sm text-green-400 h-[400px] overflow-y-auto">
        <p>Logs are stored in Google Cloud Storage.</p>
        <p className="mt-2">Click the link above to view the complete logs.</p>
      </div>
    </div>
  );
};

export default LogViewer;
