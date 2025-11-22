'use client';

import { ErrorAlert } from '@/components/ErrorAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { positionColors, positionLabels } from '@/lib/positions';
import { cn } from '@/lib/utils';
import { ArrowLeft, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
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

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="p-8">
        <ErrorAlert error={error || 'User not found'} onClose={() => router.back()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:pl-2 transition-all"
          onClick={() => router.push('/users')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTimeSpent}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logs by Category</CardTitle>
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
                <p className="text-muted-foreground text-center py-4">No logs yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.logsByProject).map(([project, count]) => (
                <div key={project} className="flex items-center justify-between">
                  <span>{project}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(stats.logsByProject).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No project logs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
