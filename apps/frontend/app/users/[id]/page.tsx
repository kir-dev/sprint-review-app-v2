'use client';

import { ErrorAlert } from '@/components/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingLogo } from '@/components/ui/LoadingLogo';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/dashboard-utils';
import { useAuth } from '@/context/AuthContext';
import { positionColors, positionLabels } from '@/lib/positions';
import { cn } from '@/lib/utils';
import { ArrowLeft, User } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { categoryColors, categoryLabels } from '../../logs/constants';
import { Position } from '../../logs/types';
import { useUserDetails } from '../hooks/useUserDetails';

export default function UserProfilePage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;

  const {
    user: fetchedUser,
    stats,
    isLoading: dataLoading,
    error,
  } = useUserDetails(userId, token);

  const [initialUser] = useState<{
    id: number;
    fullName: string;
    position: string;
    profileImage?: string;
    positionDetails?: undefined;
  } | null>(() => {
    const name = searchParams.get('name');
    if (name) {
      return {
        id: parseInt(userId),
        fullName: name,
        position: searchParams.get('position') || 'UJONC',
        profileImage: searchParams.get('image') || undefined,
        positionDetails: undefined,
      };
    }
    return null;
  });

  const user = fetchedUser || initialUser;

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login');
    }
  }, [token, isAuthLoading, router]);

  if (isAuthLoading) return null;

  const isLoading = dataLoading && !user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={100} />
      </div>
    );
  }

  if ((!user && !isLoading) || error) {
    return (
      <div className="p-8 text-center bg-background min-h-screen">
        <ErrorAlert
          error={error || 'Felhasználó nem található'}
          onClose={() => router.back()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:pl-2 transition-all"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Vissza
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
                  className={cn(
                    'mt-2',
                    user.positionDetails?.color || positionColors[user.position as Position] || 'bg-slate-500/10 text-foreground border-slate-500/20',
                  )}
                >
                  {user.positionDetails?.label || positionLabels[user.position as Position] || user.position}
                </Badge>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!stats && dataLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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
                <div className="text-2xl font-bold">
                  {formatNumber(stats.totalTimeSpent)} óra
                </div>
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
                  {Object.entries(stats.logsByCategory).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]?.split(' ')[0] || 'bg-gray-500'}`}
                          />
                          <span>
                            {categoryLabels[
                              category as keyof typeof categoryLabels
                            ] || category}
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                  {Object.keys(stats.logsByCategory).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nincs még bejegyzés
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Projektenként</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.logsByProject).map(
                    ([project, count]) => (
                      <div
                        key={project}
                        className="flex items-center justify-between"
                      >
                        <span
                          className="truncate max-w-[200px]"
                          title={project}
                        >
                          {project}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                  {Object.keys(stats.logsByProject).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nincs még projekt bejegyzés
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
