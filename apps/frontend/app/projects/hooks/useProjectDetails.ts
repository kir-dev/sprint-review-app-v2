import { apiFetch } from '@/lib/api-fetch';
import { useQuery } from '@tanstack/react-query';
import { Project, ProjectStats, User } from '../types';

export function useProjectDetails(projectId: string, token: string | null) {
  const headers = { Authorization: `Bearer ${token}` };

  const projectQuery = useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: () =>
      apiFetch(`/api/projects/${projectId}`, { headers }).then((res) => {
        if (!res.ok) throw new Error('Projekt nem található');
        return res.json();
      }),
    enabled: !!token && !!projectId,
  });

  const statsQuery = useQuery<ProjectStats>({
    queryKey: ['projects', projectId, 'stats'],
    queryFn: () =>
      apiFetch(`/api/projects/${projectId}/stats`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!projectId,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users', { headers }).then((res) => res.json()),
    enabled: !!token,
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
