import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from '@chakra-ui/react';
import { api } from '../services/api';
import { Repository, WorkflowRun } from '../types';

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

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'green';
      if (conclusion === 'failure') return 'red';
      if (conclusion === 'cancelled') return 'gray';
    }
    if (status === 'in_progress') return 'blue';
    return 'yellow';
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading workflow runs...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button onClick={onBack} mb={4}>
        ← Back to Repositories
      </Button>
      <Heading mb={6}>
        Workflow Runs for {repository.fullName}
      </Heading>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Workflow</Th>
              <Th>Status</Th>
              <Th>Branch</Th>
              <Th>Commit</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {runs.map((run) => (
              <Tr
                key={run.id}
                cursor="pointer"
                onClick={() => onSelectRun(run)}
                _hover={{ bg: 'gray.50' }}
              >
                <Td>{run.name}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(run.status, run.conclusion)}>
                    {run.conclusion || run.status}
                  </Badge>
                </Td>
                <Td>{run.branch}</Td>
                <Td>
                  <Text fontFamily="mono" fontSize="sm">
                    {run.commit}
                  </Text>
                </Td>
                <Td>{new Date(run.createdAt).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

export default WorkflowRunListPage;
