'use client';

import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingLogo } from '@/components/ui/LoadingLogo';
import { useAuth } from '@/context/AuthContext';
import { updateUserPosition } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { UsersHeader } from './components/UsersHeader';
import { UsersList } from './components/UsersList';
import { useUserData } from './hooks/useUserData';

interface PositionData {
  id: number;
  name: string;
  label: string;
  color: string;
  canManageSettings: boolean;
  canExportLogs: boolean;
  canManageEvents: boolean;
  canManageProjects: boolean;
  isLeader: boolean;
}

export default function UsersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [positions, setPositions] = useState<PositionData[]>([]);

  // Fetch roles/positions dynamically
  useEffect(() => {
    if (token) {
      fetch('/api/positions', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch positions');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setPositions(data);
        })
        .catch((err) => console.error('Error fetching positions:', err));
    }
  }, [token]);

  const {
    users,
    setUsers,
    isLoading: isLoadingUsers,
    error,
    setError,
  } = useUserData(token);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  async function handlePositionChange(userId: number, newPosition: string) {
    if (!token) {
      setError('Autentikációs token nem található. Jelentkezz be újra.');
      return;
    }
    try {
      const updatedUser = await updateUserPosition(userId, newPosition, token);
      // Preserve the _count field from the original user
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...updatedUser, _count: u._count } : u,
        ),
      );
      setError(null);
    } catch (err) {
      console.error('Error updating user position:', err);
      const message = err instanceof Error ? err.message : 'Nem sikerült frissíteni a felhasználó pozícióját. Próbáld újra.';
      setError(message);
    }
  }

  // Auth loading
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={60} />
      </div>
    );
  }

  const isInitialLoading = (isLoadingUsers || positions.length === 0) && users.length === 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
      <UsersHeader totalUsers={users.length} />

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <UsersList
        users={users}
        isLoading={isInitialLoading}
        onPositionChange={handlePositionChange}
        currentUser={user}
        positions={positions}
      />
    </div>
  );
}
