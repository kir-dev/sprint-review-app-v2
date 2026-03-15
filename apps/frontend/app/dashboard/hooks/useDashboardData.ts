import { useQuery } from '@tanstack/react-query';
import {
  DashboardEventStats,
  DashboardProjectStats,
  DashboardSummary,
  DashboardTopUser,
  CategoryBreakdownData,
  HeatmapData,
} from '@/types/dashboard';

export function useDashboardData(token: string | null) {
  const headers = { Authorization: `Bearer ${token}` };

  const summaryQuery = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () =>
      fetch('/api/dashboard/summary', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const projectsQuery = useQuery<DashboardProjectStats>({
    queryKey: ['dashboard', 'projects'],
    queryFn: () =>
      fetch('/api/dashboard/projects', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const topUsersQuery = useQuery<DashboardTopUser[]>({
    queryKey: ['dashboard', 'top-users'],
    queryFn: () =>
      fetch('/api/dashboard/top-users', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const statsQuery = useQuery<{
    categoryBreakdown: CategoryBreakdownData[];
    heatmapData: HeatmapData[];
    difficultyBreakdown: { name: string; value: number }[];
  }>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () =>
      fetch('/api/dashboard/stats', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const eventsQuery = useQuery<DashboardEventStats>({
    queryKey: ['dashboard', 'events'],
    queryFn: () =>
      fetch('/api/dashboard/events', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  return {
    summary: summaryQuery.data,
    projectsStats: projectsQuery.data,
    topUsers: topUsersQuery.data || [],
    stats: statsQuery.data,
    eventStats: eventsQuery.data,
    isLoading:
      summaryQuery.isLoading ||
      projectsQuery.isLoading ||
      topUsersQuery.isLoading ||
      statsQuery.isLoading ||
      eventsQuery.isLoading,
    refetchAll: () => {
      summaryQuery.refetch();
      projectsQuery.refetch();
      topUsersQuery.refetch();
      statsQuery.refetch();
      eventsQuery.refetch();
    },
  };
}
