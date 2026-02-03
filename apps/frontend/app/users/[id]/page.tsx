'use client';

import { ErrorAlert } from '@/components/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/context/AuthContext';
import { positionColors, positionLabels } from '@/lib/positions';
import { cn } from '@/lib/utils';
import { ArrowLeft, User } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { categoryColors, categoryLabels } from '../../logs/constants';
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

export default function UserProfilePage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(() => {
    const name = searchParams.get('name');
    if (name) {
      return {
        id: parseInt(userId),
        fullName: name,
        email: '', // Placeholder, will be updated
        position: (searchParams.get('position') as Position) || Position.UJONC,
        profileImage: searchParams.get('image') || undefined
      };
    }
    return null;
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login');
    }
  }, [token, isAuthLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!token || !userId) return;

      setIsLoading(true);
      try {
        // Fetch user details
        const userResponse = await fetch(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user stats
        const statsResponse = await fetch(`/api/logs/stats/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsResponse.ok) throw new Error('Failed to fetch user stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (err: any) {
        console.error('Error loading profile data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token, userId]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="p-8 text-center bg-background min-h-screen">
        <ErrorAlert error={error || 'Felhasználó nem található'} onClose={() => router.back()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:pl-2 transition-all"
          onClick={() => router.push('/users')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Vissza a felhasználókhoz
        </Button>

        <div className="flex items-center gap-4 animate-slide-in-left">
          {user ? (
            <>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-background shadow-lg">
                    {user.profileImage ? (
                    <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <User className="h-10 w-10 text-primary" />
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{user.fullName}</h1>
                    <Badge
                    variant="outline"
                    className={cn('mt-2', positionColors[user.position])}
                    >
                    {positionLabels[user.position]}
                    </Badge>
                </div>
            </>
          ) : (
            <>
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-center mt-4 text-muted-foreground animate-pulse">Statisztikák betöltése...</p>
        </div>
      ) : error ? (
        <ErrorAlert error={error} onClose={() => setError(null)} />
      ) : stats ? (
        <div className="space-y-6 animate-slide-in-bottom">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                    Összes Bejegyzés
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLogs}</div>
                </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                    Összes Eltöltött Idő
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTimeSpent}h</div>
                </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle>Kategóriák szerint</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {Object.entries(stats.logsByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]?.split(' ')[0] || 'bg-gray-500'}`} />
                            <span>{categoryLabels[category as keyof typeof categoryLabels] || category}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                        </div>
                    ))}
                    {Object.keys(stats.logsByCategory).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Nincs még bejegyzés</p>
                    )}
                    </div>
                </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle>Projektenként</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {Object.entries(stats.logsByProject).map(([project, count]) => (
                        <div key={project} className="flex items-center justify-between">
                        <span className="truncate max-w-[200px]" title={project}>{project}</span>
                        <span className="font-medium">{count}</span>
                        </div>
                    ))}
                    {Object.keys(stats.logsByProject).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Nincs még projekt bejegyzés</p>
                    )}
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
      ) : null}
    </div>
  );
}
