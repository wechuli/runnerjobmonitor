
import React, { useState } from 'react';
import type { RunData } from '../types';
import { analyzeRun } from '../services/geminiService';

interface AnalysisPanelProps {
  runData: RunData;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ runData }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const result = await analyzeRun(runData);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to get analysis. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // A simple markdown-like renderer
  const renderAnalysis = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-accent">{line.substring(4)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold my-2">{line.substring(2, line.length - 2)}</p>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
      }
      return <p key={index} className="my-1">{line}</p>;
    });
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">AI-Powered Analysis</h3>
      {!analysis && !isLoading && (
         <div className="flex flex-col items-start">
             <p className="text-slate-300 mb-4">
               Use Gemini to analyze the resource usage and logs to identify potential bottlenecks and suggest optimizations.
             </p>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-accent hover:bg-info text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Analyze with Gemini
            </button>
         </div>
      )}
      {isLoading && (
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-base-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="text-slate-300">Analyzing run data... This may take a moment.</span>
        </div>
      )}
      {error && <div className="p-4 bg-error/20 text-error rounded-lg">{error}</div>}
      {analysis && (
        <div className="prose prose-invert max-w-none bg-base-100 p-4 rounded-lg text-slate-300 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-base-100">
          {renderAnalysis(analysis)}
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
