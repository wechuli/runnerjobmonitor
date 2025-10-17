import React, { useState } from 'react';
import { Box, Button, Spinner, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { api } from '../services/api';

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
          <Text key={index} fontSize="xl" fontWeight="bold" mt={4} mb={2}>
            {line.substring(4)}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} fontSize="2xl" fontWeight="bold" mt={6} mb={3}>
            {line.substring(3)}
          </Text>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} fontWeight="bold" my={2}>
            {line.substring(2, line.length - 2)}
          </Text>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <Text key={index} ml={4} my={1}>
            • {line.substring(2)}
          </Text>
        );
      }
      if (line.trim() === '') {
        return <Box key={index} h={2} />;
      }
      return (
        <Text key={index} my={1}>
          {line}
        </Text>
      );
    });
  };

  return (
    <Box>
      {!analysis && !loading && (
        <Box>
          <Text mb={4} color="gray.600">
            Use Gemini AI to analyze this job's metrics and logs to identify performance bottlenecks
            and get actionable recommendations.
          </Text>
          <Button colorScheme="blue" onClick={handleAnalyze}>
            Analyze with Gemini
          </Button>
        </Box>
      )}

      {loading && (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" />
          <Text mt={4}>Analyzing job data with Gemini AI...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {analysis && (
        <Box
          bg="gray.50"
          p={6}
          borderRadius="md"
          maxH="500px"
          overflowY="auto"
          border="1px"
          borderColor="gray.200"
        >
          {renderMarkdown(analysis)}
        </Box>
      )}
    </Box>
  );
};

export default GeminiAnalysisView;
