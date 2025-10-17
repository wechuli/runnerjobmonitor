
import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  activeTimestamp: number | null;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, activeTimestamp }) => {
    const activeLogRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeLogIndex = activeTimestamp
    ? logs.findIndex((log, index) => {
        const nextLog = logs[index + 1];
        return log.timestamp <= activeTimestamp && (!nextLog || nextLog.timestamp > activeTimestamp);
      })
    : -1;

    useEffect(() => {
        if (activeLogIndex !== -1 && activeLogRef.current && containerRef.current) {
            const container = containerRef.current;
            const activeElement = activeLogRef.current;
            const containerTop = container.scrollTop;
            const containerBottom = containerTop + container.clientHeight;
            const elementTop = activeElement.offsetTop - container.offsetTop;
            const elementBottom = elementTop + activeElement.clientHeight;

            if (elementTop < containerTop || elementBottom > containerBottom) {
                 container.scrollTo({
                    top: elementTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2),
                    behavior: 'smooth',
                });
            }
        }
    }, [activeLogIndex]);


  return (
    <div ref={containerRef} className="h-96 overflow-y-auto bg-base-100 p-4 rounded-lg font-mono text-sm text-slate-300 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-base-100">
      {logs.map((log, index) => {
        const isActive = index === activeLogIndex;
        return (
            <div 
                key={log.timestamp + index} 
                ref={isActive ? activeLogRef : null}
                className={`flex gap-4 p-1 rounded transition-colors ${isActive ? 'bg-accent/20' : ''}`}
            >
                <span className="text-slate-500 select-none">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="flex-1 whitespace-pre-wrap break-words">{log.message}</span>
            </div>
        )
      })}
    </div>
  );
};

export default LogViewer;
