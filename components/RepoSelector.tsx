
import React, { useState, useEffect } from 'react';
import type { Repository, Organization } from '../types';

interface RepoSelectorProps {
  organization: Organization;
  onSelect: (repo: Repository) => void;
  onBack: () => void;
}

const RepoSelector: React.FC<RepoSelectorProps> = ({ organization, onSelect, onBack }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization) return;
    const fetchRepos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, you'd fetch based on org.
        // For this demo, we use a simplified endpoint representing the org's repos.
        const response = await fetch(`/api/repos/${organization.login}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch repositories for ${organization.name}`);
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();
  }, [organization]);
  
  if (isLoading) {
    return <div className="text-center p-10">Loading Repositories for {organization.name}...</div>;
  }

  if (error) {
    return <div className="p-4 bg-error/20 text-error rounded-lg text-center">Error: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-3xl font-bold text-neutral">Select a Repository</h2>
                 <p className="text-slate-300">Organization: <span className="font-semibold text-white">{organization.name}</span></p>
            </div>
            <button onClick={onBack} className="bg-secondary hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">&larr; Back to Organizations</button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onSelect(repo)}
            className="bg-secondary p-6 rounded-xl shadow-lg border border-slate-700 cursor-pointer hover:border-accent hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-accent">{repo.name}</h3>
            </div>
            <p className="text-slate-300">{repo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepoSelector;
