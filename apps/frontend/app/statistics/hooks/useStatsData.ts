import { apiFetch } from '@/lib/api-fetch';
import { useQuery } from '@tanstack/react-query';

export function useStatsData(userId: number, token: string | null) {
  const headers = { Authorization: `Bearer ${token}` };

  const breakdownQuery = useQuery({
    queryKey: ['stats', userId, 'breakdown'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/breakdown`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['stats', userId, 'history'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/history`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!userId,
  });

  const gamificationQuery = useQuery({
    queryKey: ['stats', userId, 'gamification'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/gamification`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!userId,
  });

  const positionsQuery = useQuery({
    queryKey: ['stats', userId, 'positions'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/positions`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!userId,
  });

  return {
    breakdown: breakdownQuery.data,
    history: historyQuery.data,
    gamification: gamificationQuery.data,
    positionHistory: positionsQuery.data || [],
    isLoading:
      breakdownQuery.isLoading ||
      historyQuery.isLoading ||
      gamificationQuery.isLoading ||
      positionsQuery.isLoading,
    isError:
      breakdownQuery.isError ||
      historyQuery.isError ||
      gamificationQuery.isError ||
      positionsQuery.isError,
  };
}
