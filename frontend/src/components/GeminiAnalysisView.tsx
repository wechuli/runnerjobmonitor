import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface GeminiAnalysisViewProps {
  jobId: number;
}

const GeminiAnalysisView: React.FC<GeminiAnalysisViewProps> = ({ jobId }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.analyzeJob(jobId);
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-bold mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold my-2">
            {line.substring(2, line.length - 2)}
          </p>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <p key={index} className="ml-4 my-1">
            • {line.substring(2)}
          </p>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div>
      {!analysis && !loading && (
        <div>
          <p className="mb-4 text-muted-foreground">
            Use Gemini AI to analyze this job's metrics and logs to identify performance bottlenecks
            and get actionable recommendations.
          </p>
          <Button onClick={handleAnalyze}>
            Analyze with Gemini
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Analyzing job data with Gemini AI...</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {analysis && (
        <div className="bg-muted/50 p-6 rounded-md max-h-[500px] overflow-y-auto border">
          {renderMarkdown(analysis)}
        </div>
      )}
    </div>
  );
};

export default GeminiAnalysisView;
