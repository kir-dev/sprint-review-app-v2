import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Project, User } from '../types';

export function useProjectData(token: string | null) {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const projectsQuery = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () =>
      fetch('/api/projects', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users', { headers }).then((res) => res.json()),
    enabled: !!token,
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
