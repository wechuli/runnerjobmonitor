import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  List,
  ListItem,
} from '@chakra-ui/react';
import { api } from '../services/api';
import { WorkflowRun, Job, JobDetail, MetricChartData } from '../types';
import MetricsChart from '../components/MetricsChart';
import LogViewer from '../components/LogViewer';
import GeminiAnalysisView from '../components/GeminiAnalysisView';

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

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading jobs...</Text>
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

  if (jobs.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Button onClick={onBack} mb={4}>
          ← Back to Runs
        </Button>
        <Alert status="info">
          <AlertIcon />
          No jobs found for this workflow run.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button onClick={onBack} mb={4}>
        ← Back to Runs
      </Button>
      <Heading mb={6}>{workflowRun.name}</Heading>

      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Jobs</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={2}>
                {jobs.map((job) => (
                  <ListItem
                    key={job.id}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    bg={selectedJob?.id === job.id ? 'blue.50' : 'white'}
                    border="1px"
                    borderColor={selectedJob?.id === job.id ? 'blue.300' : 'gray.200'}
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleSelectJob(job.id)}
                  >
                    <Text fontWeight="medium" mb={1}>
                      {job.name}
                    </Text>
                    <Badge
                      colorScheme={
                        job.conclusion === 'success'
                          ? 'green'
                          : job.conclusion === 'failure'
                          ? 'red'
                          : 'yellow'
                      }
                    >
                      {job.conclusion || job.status}
                    </Badge>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          {loadingDetail ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
              <Text mt={4}>Loading job details...</Text>
            </Box>
          ) : selectedJob ? (
            <Box>
              <Card mb={6}>
                <CardHeader>
                  <Heading size="md">Job Information</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Status
                      </Text>
                      <Badge
                        colorScheme={
                          selectedJob.conclusion === 'success'
                            ? 'green'
                            : selectedJob.conclusion === 'failure'
                            ? 'red'
                            : 'yellow'
                        }
                      >
                        {selectedJob.conclusion || selectedJob.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Started At
                      </Text>
                      <Text>
                        {selectedJob.startedAt
                          ? new Date(selectedJob.startedAt).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Completed At
                      </Text>
                      <Text>
                        {selectedJob.completedAt
                          ? new Date(selectedJob.completedAt).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Branch
                      </Text>
                      <Text>{selectedJob.branch || 'N/A'}</Text>
                    </Box>
                  </Grid>
                </CardBody>
              </Card>

              <Card mb={6}>
                <CardHeader>
                  <Heading size="md">Resource Metrics</Heading>
                </CardHeader>
                <CardBody>
                  <MetricsChart data={formatMetricsForChart(selectedJob)} />
                </CardBody>
              </Card>

              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Job Logs</Heading>
                  </CardHeader>
                  <CardBody>
                    <LogViewer logUrl={selectedJob.logUrl} />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">AI Analysis</Heading>
                  </CardHeader>
                  <CardBody>
                    <GeminiAnalysisView jobId={selectedJob.id} />
                  </CardBody>
                </Card>
              </Grid>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              Select a job to view details
            </Alert>
          )}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default JobDetailPage;
