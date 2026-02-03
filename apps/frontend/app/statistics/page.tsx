'use client';

import { PageHeader } from '@/components/PageHeader';
import { EventStatistics } from '@/components/statistics/EventStatistics';
import { Gamification } from '@/components/statistics/Gamification';
import { LogStatistics } from '@/components/statistics/LogStatistics';
import { Visualizations } from '@/components/statistics/Visualizations';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { BarChart3 } from 'lucide-react';
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

  if (!user && !authLoading) {
    return (
        <div className="container mx-auto py-10 px-4 md:px-0 space-y-8 max-w-7xl">
            <PageHeader
                title="Személyes Statisztikák"
                description="Részletes áttekintés a logjaidról, eseményeidről és előrehaladásodról."
                icon={BarChart3}
            />
            <div className="p-10 text-center border rounded-lg bg-muted/50">Kérjük, jelentkezz be a statisztikák megtekintéséhez.</div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 md:pt-4 space-y-8 max-w-7xl">
      <PageHeader
        title="Személyes Statisztikák"
        description="Részletes áttekintés a logjaidról, eseményeidről és előrehaladásodról."
        icon={BarChart3}
      />

      {(authLoading || (loading && !breakdown)) ? (
        <div className="space-y-8 animate-pulse">
             <Skeleton className="h-[200px] w-full" />
             <Skeleton className="h-[300px] w-full" />
             <Skeleton className="h-[200px] w-full" />
        </div>
      ) : (!breakdown || !history || !gamification) ? (
        <div className="p-10 text-center border rounded-lg bg-muted/50">Nem sikerült betölteni a statisztikai adatokat.</div>
      ) : (
        <div className="space-y-8 animate-fade-in">
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
      )}
      
    </div>
  );
}
