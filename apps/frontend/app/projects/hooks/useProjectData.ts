import { apiFetch } from '@/lib/api-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Project, User } from '../types';

export function useProjectData(isAuthenticated: boolean | null) {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiFetch('/api/projects').then((res) => res.json()),
    enabled: !!isAuthenticated,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users').then((res) => res.json()),
    enabled: !!isAuthenticated,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  async function loadData() {
    try {
      await Promise.all([projectsQuery.refetch(), usersQuery.refetch()]);
      setLocalError(null);
    } catch (err) {
      setLocalError('Hiba történt az adatok frissítésekor');
    }
  }

  return {
    projects: projectsQuery.data || [],
    users: usersQuery.data || [],
    isLoading: projectsQuery.isLoading || usersQuery.isLoading,
    error: projectsQuery.error
      ? 'Nem sikerült betölteni a projekteket'
      : localError,
    setError: setLocalError,
    loadData,
    setProjects: (projects: Project[]) => {
      queryClient.setQueryData(['projects'], projects);
    },
  };
}
