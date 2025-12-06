import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEventStats } from "@/types/dashboard";
import { CalendarDays } from "lucide-react";

interface EventListProps {
  stats: DashboardEventStats | null;
  loading?: boolean;
}

export function EventList({ stats, loading }: EventListProps) {
  if (loading) {
     return <div className="animate-pulse h-64 bg-secondary rounded-lg" />;
  }

  const upcoming = stats?.upcoming || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Közelgő Események
        </CardTitle>
        <CardDescription>Ne felejts el részt venni!</CardDescription>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nincs közelgő esemény.</p>
        ) : (
            <div className="space-y-4">
                {upcoming.map((event) => (
                    <div key={event.id} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium text-sm">{event.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(event.startDate).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge 
                            variant="outline" 
                            className={event.type === 'SIMONYI' 
                                ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}
                        >
                            {event.type === 'KIR_DEV' ? 'Kir-Dev' : 'Simonyi'}
                        </Badge>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
