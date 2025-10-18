import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrganizations } from '@/services/api';
import type { Organization } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Buildings } from '@phosphor-icons/react';

export const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-6 tracking-tight">
          Organizations
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
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
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Organizations
        </h2>
        <p className="text-muted-foreground">
          Select an organization to view its repositories and workflow runs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            onClick={() => navigate(`/orgs/${org.login}/repos`)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <img
                  src={org.avatar_url}
                  alt={org.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1 flex items-center gap-2">
                    <Buildings size={18} weight="fill" className="text-accent flex-shrink-0" />
                    <span className="truncate">{org.name}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">
                    @{org.login}
                  </p>
                </div>
              </div>
              <CardDescription className="mt-3">
                {org.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Buildings size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No organizations found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
