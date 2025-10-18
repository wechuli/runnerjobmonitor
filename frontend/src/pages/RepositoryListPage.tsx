import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Organization, Repository } from '@/types';
import { api } from '@/services/api';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

interface RepositoryListPageProps {
  organization: Organization;
  onSelectRepository: (repo: Repository) => void;
  onBack: () => void;
}

const RepositoryListPage: React.FC<RepositoryListPageProps> = ({
  organization,
  onSelectRepository,
  onBack,
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const data = await api.getRepositories(organization.login);
        setRepositories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [organization]);

  const sidebar = (
    <Sidebar title="Navigation" onBack={onBack}>
      <div className="px-2 py-2">
        <p className="text-sm font-medium">Organization</p>
        <p className="text-sm text-muted-foreground mt-1">{organization.name}</p>
      </div>
    </Sidebar>
  );

  if (loading) {
    return (
      <Layout sidebar={sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading repositories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout sidebar={sidebar}>
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground mt-2">
            Select a repository to view its workflow runs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repositories.map((repo) => (
            <Card
              key={repo.fullName}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => onSelectRepository(repo)}
            >
              <CardContent className="p-6">
                <p className="font-semibold text-lg mb-2">{repo.name}</p>
                {repo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default RepositoryListPage;
