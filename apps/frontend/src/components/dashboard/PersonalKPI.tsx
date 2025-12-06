import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types/dashboard";
import { Briefcase, Clock, Users } from "lucide-react";

interface PersonalKPIProps {
  summary: DashboardSummary | null;
  loading?: boolean;
}

export function PersonalKPI({ summary, loading }: PersonalKPIProps) {
  if (loading) {
     return <div className="animate-pulse h-32 bg-secondary rounded-lg" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Personal Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saját Órák</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.totalHours || 0} óra</div>
          <p className="text-xs text-muted-foreground">
            {summary?.currentPeriod?.name || 'Jelenlegi időszak'}
          </p>
        </CardContent>
      </Card>
      
      {/* Group Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kör Összes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.groupTotalHours || 0} óra</div>
          <p className="text-xs text-muted-foreground">
            {summary?.activeContributors || 0} aktív tag
          </p>
        </CardContent>
      </Card>

      {/* Active Projects should span full width or be part of right column? Let's keep grid 2 for consistency but maybe span 2? */}
      {/* Actually, user requested *more* global stats. */}
      {/* Let's make "Active Projects" also show global active projects count maybe? */}
      {/* For now keeping personal active projects as "active membership" metric */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktív Projektek (Saját)</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary?.activeProjects || 0}</div>
          <p className="text-xs text-muted-foreground">
            Amihez hozzájárultál
          </p>
        </CardContent>
      </Card>

      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlag / Tag</CardTitle>
             {/* Using Clock or another icon */}
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.averageHoursPerUser.toFixed(1) || 0} óra</div>
            <p className="text-xs text-muted-foreground">
              Átlagos aktivitás
            </p>
          </CardContent>
      </Card>
    </div>
  );
}
