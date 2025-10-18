import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { OrganizationsPage } from '@/pages/OrganizationsPage';
import { RepositoriesPage } from '@/pages/RepositoriesPage';
import { WorkflowRunsPage } from '@/pages/WorkflowRunsPage';
import { JobsPage } from '@/pages/JobsPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { Toaster } from '@/components/ui/sonner';

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<OrganizationsPage />} />
        <Route path="/orgs/:org/repos" element={<RepositoriesPage />} />
        <Route path="/orgs/:org/repos/:repo/runs" element={<WorkflowRunsPage />} />
        <Route path="/orgs/:org/repos/:repo/runs/:runId/jobs" element={<JobsPage />} />
        <Route
          path="/orgs/:org/repos/:repo/runs/:runId/jobs/:jobId"
          element={<JobDetailPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ProtectedRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;