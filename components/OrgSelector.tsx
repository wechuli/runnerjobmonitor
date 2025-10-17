
import React, { useState, useEffect } from 'react';
import type { Organization } from '../types';

interface OrgSelectorProps {
  onSelect: (org: Organization) => void;
}

const OrgSelector: React.FC<OrgSelectorProps> = ({ onSelect }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Loading Organizations...</div>;
  }

  if (error) {
    return <div className="p-4 bg-error/20 text-error rounded-lg text-center">Error: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-neutral">Select an Organization</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            onClick={() => onSelect(org)}
            className="bg-secondary p-6 rounded-xl shadow-lg border border-slate-700 cursor-pointer hover:border-accent hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center mb-2">
                <img src={org.avatarUrl} alt={`${org.name} avatar`} className="h-8 w-8 rounded-full mr-3 border-2 border-slate-600" />
                <h3 className="text-xl font-bold text-accent">{org.name}</h3>
            </div>
            <p className="text-slate-300">Login: <span className="font-mono bg-base-100 px-2 py-1 rounded">{org.login}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgSelector;
