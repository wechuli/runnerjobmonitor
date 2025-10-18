import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Organization } from '@/types';
import { dummyOrganizations } from '@/data/dummyData';
import Layout from '@/components/Layout';

interface OrganizationListPageProps {
  onSelectOrganization: (org: Organization) => void;
}

const OrganizationListPage: React.FC<OrganizationListPageProps> = ({ onSelectOrganization }) => {
  const [organizations] = useState<Organization[]>(dummyOrganizations);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-2">
            Select an organization to view its repositories and workflow runs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => onSelectOrganization(org)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={org.avatarUrl || undefined} alt={org.name} />
                  <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{org.name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{org.login}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizationListPage;
