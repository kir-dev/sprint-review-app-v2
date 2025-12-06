'use client';

import { EventStatistics } from '@/components/statistics/EventStatistics';
import { Gamification } from '@/components/statistics/Gamification';
import { LogStatistics } from '@/components/statistics/LogStatistics';
import { Visualizations } from '@/components/statistics/Visualizations';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function StatisticsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // We use userId in URL as backend expects it now (no auth guard in controller yet)
        // But we send token just in case.
        const [breakdownRes, historyRes, gamificationRes] = await Promise.all([
           fetch(`/api/stats/${user.id}/breakdown`, { headers }),
           fetch(`/api/stats/${user.id}/history`, { headers }),
           fetch(`/api/stats/${user.id}/gamification`, { headers }),
        ]);

        if (breakdownRes.ok) setBreakdown(await breakdownRes.json());
        if (historyRes.ok) setHistory(await historyRes.json());
        if (gamificationRes.ok) setGamification(await gamificationRes.json());

      } catch (error) {
        console.error('Failed to fetch statistics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  if (authLoading || (loading && !breakdown)) {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
    );
  }

  if (!user) {
    return <div className="p-10 text-center">Kérjük, jelentkezz be a statisztikák megtekintéséhez.</div>;
  }

  // Fallback if APIs failed
  if (!breakdown || !history || !gamification) {
      return <div className="p-10 text-center">Nem sikerült betölteni a statisztikai adatokat.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Személyes Statisztikák</h2>
        <p className="text-muted-foreground">
          Részletes áttekintés a logjaidról, eseményeidről és előrehaladásodról.
        </p>
      </div>

      <LogStatistics data={breakdown} />
      
      <Visualizations 
        breakdownData={breakdown} 
        historyData={history} 
      />

      <div className="grid gap-6 md:grid-cols-2">
         {/* Layout adjustment: Gamification takes full width or half */}
      </div>

      <Gamification data={gamification} />

      <EventStatistics data={breakdown.eventStats} />
      
    </div>
  );
}
