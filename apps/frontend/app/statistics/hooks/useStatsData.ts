import { apiFetch } from '@/lib/api-fetch';
import { useQuery } from '@tanstack/react-query';

export function useStatsData(userId: number, isAuthenticated: boolean | null) {
  const breakdownQuery = useQuery({
    queryKey: ['stats', userId, 'breakdown'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/breakdown`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['stats', userId, 'history'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/history`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!userId,
  });

  const gamificationQuery = useQuery({
    queryKey: ['stats', userId, 'gamification'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/gamification`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!userId,
  });

  const positionsQuery = useQuery({
    queryKey: ['stats', userId, 'positions'],
    queryFn: () =>
      apiFetch(`/api/stats/${userId}/positions`).then((res) => res.json()),
    enabled: !!isAuthenticated && !!userId,
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
