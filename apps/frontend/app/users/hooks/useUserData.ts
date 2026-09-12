import { apiFetch } from '@/lib/api-fetch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { User } from '../types';

export function useUserData(
  isAuthenticated: boolean | null,
  enabled: boolean = true,
) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users').then((res) => res.json()),
    enabled: !!isAuthenticated && enabled,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      await usersQuery.refetch();
      setLocalError(null);
    } catch (err) {
      setLocalError('Hiba történt a felhasználók frissítésekor');
    }
  }

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error
      ? 'Nem sikerült betölteni a felhasználókat'
      : localError,
    setError: setLocalError,
    loadUsers,
    setUsers: (users: User[]) => {
      queryClient.setQueryData(['users'], users);
    },
  };
}
