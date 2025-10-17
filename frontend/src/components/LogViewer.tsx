import React from 'react';
import { Box, Text, Link } from '@chakra-ui/react';

interface LogViewerProps {
  logUrl: string | null;
}

const LogViewer: React.FC<LogViewerProps> = ({ logUrl }) => {
  if (!logUrl) {
    return (
      <Box
        bg="gray.900"
        p={4}
        borderRadius="md"
        fontFamily="mono"
        fontSize="sm"
        color="gray.400"
        height="400px"
        overflowY="auto"
      >
        <Text>No logs available yet. Logs will be uploaded when the job completes.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Link href={logUrl} isExternal color="blue.500" mb={2} display="block">
        View Full Logs in GCP Storage
      </Link>
      <Box
        bg="gray.900"
        p={4}
        borderRadius="md"
        fontFamily="mono"
        fontSize="sm"
        color="green.400"
        height="400px"
        overflowY="auto"
      >
        <Text>Logs are stored in Google Cloud Storage.</Text>
        <Text mt={2}>Click the link above to view the complete logs.</Text>
      </Box>
    </Box>
  );
};

export default LogViewer;
