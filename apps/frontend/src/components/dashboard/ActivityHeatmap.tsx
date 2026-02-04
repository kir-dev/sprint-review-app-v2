'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HeatmapData } from "@/types/dashboard";

interface ActivityHeatmapProps {
  data: HeatmapData[];
  loading?: boolean;
  startDate?: string;
  endDate?: string;
}

export function ActivityHeatmap({ data, loading, startDate, endDate }: ActivityHeatmapProps) {
  if (loading) {
     return <div className="animate-pulse h-48 bg-secondary rounded-lg" />;
  }

  // Helper to generate dates for the work period
  const generateCalendarGrid = () => {
    const dates = [];
    
    // Default to last 12 weeks if no dates provided
    let start = startDate ? new Date(startDate) : new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);
    // Ensure start is not invalid
    if (isNaN(start.getTime())) start = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);

    let end = endDate ? new Date(endDate) : new Date();
    // Ensure end is not invalid and after start
    if (isNaN(end.getTime()) || end < start) end = new Date();

    const current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const calendarDates = generateCalendarGrid();
  
  // Create a map for fast lookup
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  const getColor = (count: number) => {
    if (count === 0) return "bg-secondary";
    if (count < 2) return "bg-green-200 dark:bg-green-900/40";
    if (count < 4) return "bg-green-400 dark:bg-green-700/60";
    if (count < 6) return "bg-green-600 dark:bg-green-600/80";
    return "bg-green-800 dark:bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitási Hőtérkép</CardTitle>
        <CardDescription>Aktivitás a jelenlegi időszakban</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex flex-wrap gap-1 justify-center md:justify-start">
             <TooltipProvider delayDuration={100}>
                {calendarDates.map((date, i) => {
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const count = dataMap.get(dateStr) || 0;
                    return (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={`w-3 h-3 rounded-sm ${getColor(count)} cursor-default transition-colors hover:ring-1 hover:ring-ring`}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">
                                    {date.toLocaleDateString('hu-HU')}: <strong>{count}ó</strong>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
             </TooltipProvider>
         </div>
      </CardContent>
    </Card>
  );
}
