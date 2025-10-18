import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRepositories } from '@/services/api';
import type { Repository } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FolderOpen, Lock } from '@phosphor-icons/react';

export const RepositoriesPage = () => {
  const { org } = useParams<{ org: string }>();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRepositories = async () => {
      if (!org) return;
      try {
        const data = await fetchRepositories(org);
        setRepositories(data);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRepositories();
  }, [org]);

  if (loading) {
    return (
      <div>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Organizations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{org}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2 className="text-3xl font-semibold text-foreground mb-6 tracking-tight">
          Repositories
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{org}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Repositories
        </h2>
        <p className="text-muted-foreground">
          Select a repository to view its workflow runs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {repositories.map((repo) => (
          <Card
            key={repo.id}
            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
            onClick={() => navigate(`/orgs/${org}/repos/${repo.name}/runs`)}
          >
            <CardHeader>
              <CardTitle className="text-lg mb-1 flex items-center gap-2">
                <FolderOpen size={20} weight="fill" className="text-accent flex-shrink-0" />
                <span className="truncate">{repo.name}</span>
                {repo.private && (
                  <Lock size={16} className="text-muted-foreground" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {repo.full_name}
              </p>
              <CardDescription>
                {repo.description || 'No description available'}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
