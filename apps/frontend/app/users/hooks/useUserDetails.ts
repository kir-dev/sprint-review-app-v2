import { apiFetch } from '@/lib/api-fetch';
import { useQuery } from '@tanstack/react-query';

interface UserDetails {
  id: number;
  fullName: string;
  email: string;
  position: string;
  profileImage?: string;
  positionDetails?: {
    id: number;
    name: string;
    label: string;
    color: string;
    canManageSettings: boolean;
    canExportLogs: boolean;
    canManageEvents: boolean;
    canManageProjects: boolean;
    isLeader: boolean;
  };
}

interface UserStats {
  totalLogs: number;
  totalTimeSpent: number;
  logsByCategory: Record<string, number>;
  logsByDifficulty: Record<string, number>;
  logsByProject: Record<string, number>;
}

export function useUserDetails(
  userId: string,
  isAuthenticated: boolean | null,
) {
  const userQuery = useQuery<UserDetails>({
    queryKey: ['users', userId],
    queryFn: () =>
      apiFetch(`/api/users/${userId}`).then((res) => {
        if (!res.ok) throw new Error('Felhasználó nem található');
        return res.json();
      }),
    enabled: !!isAuthenticated && !!userId,
  });

  const statsQuery = useQuery<UserStats>({
    queryKey: ['users', userId, 'stats'],
    queryFn: () =>
      apiFetch(`/api/logs/stats/user/${userId}`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!userId,
  });

  return {
    user: userQuery.data || null,
    stats: statsQuery.data || null,
    isLoading: userQuery.isLoading || statsQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error instanceof Error ? userQuery.error.message : null,
  };
}
