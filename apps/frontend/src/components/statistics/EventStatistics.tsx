import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users } from 'lucide-react';

interface EventStatisticsProps {
  data: {
    totalEvents: number;
    totalLogEntries: number;
    avgTimePerEvent: number;
  };
}

export function EventStatistics({ data }: EventStatisticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Események Száma</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalEvents}</div>
          <p className="text-xs text-muted-foreground">Különböző események</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Logok Eseményekre</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalLogEntries}</div>
          <p className="text-xs text-muted-foreground">Összes bejegyzés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Átlagos Idő / Esemény</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.avgTimePerEvent.toFixed(1)} óra</div>
          <p className="text-xs text-muted-foreground">Jelenlét átlagosan</p>
        </CardContent>
      </Card>
    </div>
  );
}
