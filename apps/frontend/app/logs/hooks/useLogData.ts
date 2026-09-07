import { apiFetch } from '@/lib/api-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Log, Project, WorkPeriod } from '../types';

export function useLogData(token: string | null, userId: number | undefined) {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const logsQuery = useQuery<Log[]>({
    queryKey: ['logs', userId],
    queryFn: () =>
      apiFetch(`/api/logs${userId ? `?userId=${userId}` : ''}`, { headers }).then(
        (res) => res.json(),
      ),
    enabled: !!token,
  });

  const projectsQuery = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () =>
      apiFetch('/api/projects', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const workPeriodsQuery = useQuery<WorkPeriod[]>({
    queryKey: ['work-periods'],
    queryFn: () =>
      apiFetch('/api/work-periods', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const currentWorkPeriodQuery = useQuery<WorkPeriod | null>({
    queryKey: ['work-periods', 'current'],
    queryFn: () =>
      apiFetch('/api/work-periods/current', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const sortedProjects = useMemo(() => {
    const projects = projectsQuery.data || [];
    const logs = logsQuery.data || [];

    if (projects.length === 0) return [];
    if (logs.length === 0)
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));

    // Get last logging date for each project (O(N) where N is logs count)
    const lastLogDates = new Map<number, number>();
    logs.forEach((log) => {
      if (log.projectId) {
        const date = new Date(log.date).getTime();
        const currentMax = lastLogDates.get(log.projectId) || 0;
        if (date > currentMax) {
          lastLogDates.set(log.projectId, date);
        }
      }
    });

    // Sort projects (O(M log M) where M is projects count)
    return [...projects].sort((a, b) => {
      const dateA = lastLogDates.get(a.id) || 0;
      const dateB = lastLogDates.get(b.id) || 0;

      if (dateA !== dateB) {
        return dateB - dateA; // Most recent first
      }
      return a.name.localeCompare(b.name); // Alphabetical secondary sort
    });
  }, [projectsQuery.data, logsQuery.data]);

  async function loadData() {
    try {
      await Promise.all([
        logsQuery.refetch(),
        projectsQuery.refetch(),
        workPeriodsQuery.refetch(),
        currentWorkPeriodQuery.refetch(),
      ]);
      setLocalError(null);
    } catch (err) {
      setLocalError('Hiba történt az adatok frissítésekor');
    }
  }

  return {
    logs: logsQuery.data || [],
    projects: sortedProjects,
    workPeriods: workPeriodsQuery.data || [],
    currentWorkPeriod: currentWorkPeriodQuery.data || null,
    isLoading:
      logsQuery.isLoading ||
      projectsQuery.isLoading ||
      workPeriodsQuery.isLoading ||
      currentWorkPeriodQuery.isLoading,
    error: logsQuery.error ? 'Nem sikerült betölteni a naplókat' : localError,
    setError: setLocalError,
    loadData,
    setLogs: (logs: Log[]) => {
      queryClient.setQueryData(['logs', userId], logs);
    },
  };
}
