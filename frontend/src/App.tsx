import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Organization, Repository, WorkflowRun } from './types';
import OrganizationListPage from './pages/OrganizationListPage';
import RepositoryListPage from './pages/RepositoryListPage';
import WorkflowRunListPage from './pages/WorkflowRunListPage';
import JobDetailPage from './pages/JobDetailPage';
import LoginPage from './pages/LoginPage';

type AppStep = 'organizations' | 'repositories' | 'runs' | 'jobs';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
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
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
