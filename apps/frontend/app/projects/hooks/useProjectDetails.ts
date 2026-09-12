import { apiFetch } from '@/lib/api-fetch';
import { useQuery } from '@tanstack/react-query';
import { Project, ProjectStats, User } from '../types';

export function useProjectDetails(
  projectId: string,
  isAuthenticated: boolean | null,
) {
  const projectQuery = useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: () =>
      apiFetch(`/api/projects/${projectId}`).then((res) => {
        if (!res.ok) throw new Error('Projekt nem található');
        return res.json();
      }),
    enabled: !!isAuthenticated && !!projectId,
  });

  const statsQuery = useQuery<ProjectStats>({
    queryKey: ['projects', projectId, 'stats'],
    queryFn: () =>
      apiFetch(`/api/projects/${projectId}/stats`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!projectId,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users').then((res) => res.json()),
    enabled: !!isAuthenticated,
  });

  return {
    project: projectQuery.data || null,
    stats: statsQuery.data || null,
    users: usersQuery.data || [],
    isLoading:
      projectQuery.isLoading || statsQuery.isLoading || usersQuery.isLoading,
    isError: projectQuery.isError,
    error:
      projectQuery.error instanceof Error ? projectQuery.error.message : null,
    refetchStats: () => statsQuery.refetch(),
  };
}
