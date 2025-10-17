import React, { useState } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { Organization, Repository, WorkflowRun } from './types';
import OrganizationListPage from './pages/OrganizationListPage';
import RepositoryListPage from './pages/RepositoryListPage';
import WorkflowRunListPage from './pages/WorkflowRunListPage';
import JobDetailPage from './pages/JobDetailPage';

type AppStep = 'organizations' | 'repositories' | 'runs' | 'jobs';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('organizations');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setStep('repositories');
  };

  const handleSelectRepository = (repo: Repository) => {
    setSelectedRepository(repo);
    setStep('runs');
  };

  const handleSelectRun = (run: WorkflowRun) => {
    setSelectedRun(run);
    setStep('jobs');
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
    setSelectedRepository(null);
    setSelectedRun(null);
    setStep('organizations');
  };

  const handleBackToRepositories = () => {
    setSelectedRepository(null);
    setSelectedRun(null);
    setStep('repositories');
  };

  const handleBackToRuns = () => {
    setSelectedRun(null);
    setStep('runs');
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        {step === 'organizations' && (
          <OrganizationListPage onSelectOrganization={handleSelectOrganization} />
        )}
        {step === 'repositories' && selectedOrganization && (
          <RepositoryListPage
            organization={selectedOrganization}
            onSelectRepository={handleSelectRepository}
            onBack={handleBackToOrganizations}
          />
        )}
        {step === 'runs' && selectedRepository && (
          <WorkflowRunListPage
            repository={selectedRepository}
            onSelectRun={handleSelectRun}
            onBack={handleBackToRepositories}
          />
        )}
        {step === 'jobs' && selectedRun && (
          <JobDetailPage workflowRun={selectedRun} onBack={handleBackToRuns} />
        )}
      </Box>
    </ChakraProvider>
  );
};

export default App;
