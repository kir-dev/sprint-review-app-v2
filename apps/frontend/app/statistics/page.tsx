'use client';

import { PageHeader } from '@/components/PageHeader';
import { EventStatistics } from '@/components/statistics/EventStatistics';
import { Gamification } from '@/components/statistics/Gamification';
import { LogStatistics } from '@/components/statistics/LogStatistics';
import { PositionTimeline } from '@/components/statistics/PositionTimeline';
import { Visualizations } from '@/components/statistics/Visualizations';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import { useStatsData } from './hooks/useStatsData';

export default function StatisticsPage() {
  const { user, token, isLoading: authLoading } = useAuth();

  const {
    breakdown,
    history,
    gamification,
    positionHistory,
    isLoading: statsLoading,
    isError,
  } = useStatsData(user?.id || 0, token);

  if (!user && !authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-0 space-y-8 max-w-7xl">
        <PageHeader
          title="Személyes Statisztikák"
          description="Részletes áttekintés a logjaidról, eseményeidről és előrehaladásodról."
          icon={BarChart3}
        />
        <div className="p-10 text-center border rounded-lg bg-muted/50">
          Kérjük, jelentkezz be a statisztikák megtekintéséhez.
        </div>
      </div>
    );
  }

  const loading = statsLoading || authLoading;

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 md:pt-4 space-y-8 max-w-7xl">
      <PageHeader
        title="Személyes Statisztikák"
        description="Részletes áttekintés a logjaidról, eseményeidről és előrehaladásodról."
        icon={BarChart3}
      />

      {loading && !breakdown ? (
        <div className="space-y-8 animate-pulse">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : isError || !breakdown || !history || !gamification ? (
        <div className="p-10 text-center border rounded-lg bg-muted/50">
          Nem sikerült betölteni a statisztikai adatokat.
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
          <LogStatistics data={breakdown} />

          <Visualizations breakdownData={breakdown} historyData={history} />

          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            <Gamification data={gamification} />
            <PositionTimeline
              currentPosition={user!.position}
              history={positionHistory}
              className="mb-6"
            />
          </div>

          <EventStatistics data={breakdown.eventStats} />
        </div>
      )}
    </div>
  );
}
