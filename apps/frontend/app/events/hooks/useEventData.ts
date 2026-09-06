import { apiFetch } from '@/lib/api-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Event } from '../types';

export function useEventData(token: string | null) {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const eventsQuery = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => apiFetch('/api/events', { headers }).then((res) => res.json()),
    enabled: !!token,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  async function loadData() {
    try {
      await eventsQuery.refetch();
      setLocalError(null);
    } catch (err) {
      setLocalError('Hiba történt az események frissítésekor');
    }
  }

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error
      ? 'Nem sikerült betölteni az eseményeket'
      : localError,
    setError: setLocalError,
    loadData,
    setEvents: (events: Event[]) => {
      queryClient.setQueryData(['events'], events);
    },
  };
}
