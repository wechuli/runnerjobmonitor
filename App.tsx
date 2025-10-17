
import React, { useState } from 'react';
import type { Repository, WorkflowRunSummary, Organization } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import RepoSelector from './components/RepoSelector';
import RunSelector from './components/RunSelector';
import OrgSelector from './components/OrgSelector';

type AppStep = 'login' | 'org-select' | 'repo-select' | 'run-select' | 'dashboard';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('login');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedRunSummary, setSelectedRunSummary] = useState<WorkflowRunSummary | null>(null);

  const handleLogin = () => {
    setStep('org-select');
  };

  const handleLogout = () => {
    setSelectedOrg(null);
    setSelectedRepo(null);
    setSelectedRunSummary(null);
    setStep('login');
  };

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setStep('repo-select');
  };

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setStep('run-select');
  };
  
  const handleRunSelect = (run: WorkflowRunSummary) => {
    setSelectedRunSummary(run);
    setStep('dashboard');
  };

  const handleBackToOrgs = () => {
    setSelectedOrg(null);
    setStep('org-select');
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setStep('repo-select');
  };

  const handleBackToRuns = () => {
    setSelectedRunSummary(null);
    setStep('run-select');
  };

  const renderStep = () => {
    switch (step) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'org-select':
        return <OrgSelector onSelect={handleOrgSelect} />;
      case 'repo-select':
        if (!selectedOrg) return null;
        return <RepoSelector organization={selectedOrg} onSelect={handleRepoSelect} onBack={handleBackToOrgs} />;
      case 'run-select':
        if (!selectedRepo) return null;
        return <RunSelector repository={selectedRepo} onSelectRun={handleRunSelect} onBack={handleBackToRepos} />;
      case 'dashboard':
        if (!selectedRunSummary) return null;
        return <Dashboard runSummary={selectedRunSummary} onBackToRuns={handleBackToRuns} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Header isLoggedIn={step !== 'login'} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {renderStep()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>GitHub Actions Runner Monitor &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;
