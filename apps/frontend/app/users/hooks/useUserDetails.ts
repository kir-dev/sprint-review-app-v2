import { useQuery } from '@tanstack/react-query';
import { Position } from '../../logs/types';

interface UserDetails {
  id: number;
  fullName: string;
  email: string;
  position: Position;
  profileImage?: string;
}

interface UserStats {
  totalLogs: number;
  totalTimeSpent: number;
  logsByCategory: Record<string, number>;
  logsByDifficulty: Record<string, number>;
  logsByProject: Record<string, number>;
}

export function useUserDetails(userId: string, token: string | null) {
  const headers = { Authorization: `Bearer ${token}` };

  const userQuery = useQuery<UserDetails>({
    queryKey: ['users', userId],
    queryFn: () =>
      fetch(`/api/users/${userId}`, { headers }).then((res) => {
        if (!res.ok) throw new Error('Felhasználó nem található');
        return res.json();
      }),
    enabled: !!token && !!userId,
  });

  const statsQuery = useQuery<UserStats>({
    queryKey: ['users', userId, 'stats'],
    queryFn: () =>
      fetch(`/api/logs/stats/user/${userId}`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!userId,
  });

  return {
    user: userQuery.data || null,
    stats: statsQuery.data || null,
    isLoading: userQuery.isLoading || statsQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error instanceof Error ? userQuery.error.message : null,
  };
}
