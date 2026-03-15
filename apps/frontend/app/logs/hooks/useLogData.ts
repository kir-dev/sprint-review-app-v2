import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Log, Project, WorkPeriod } from '../types';

export function useLogData(token: string | null, userId: number | undefined) {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const logsQuery = useQuery<Log[]>({
    queryKey: ['logs', userId],
    queryFn: () =>
      fetch(`/api/logs${userId ? `?userId=${userId}` : ''}`, { headers }).then(
        (res) => res.json(),
      ),
    enabled: !!token,
  });

  const projectsQuery = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () =>
      fetch('/api/projects', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const workPeriodsQuery = useQuery<WorkPeriod[]>({
    queryKey: ['work-periods'],
    queryFn: () =>
      fetch('/api/work-periods', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const currentWorkPeriodQuery = useQuery<WorkPeriod | null>({
    queryKey: ['work-periods', 'current'],
    queryFn: () =>
      fetch('/api/work-periods/current', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const [localError, setLocalError] = useState<string | null>(null);

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
    projects: projectsQuery.data || [],
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
