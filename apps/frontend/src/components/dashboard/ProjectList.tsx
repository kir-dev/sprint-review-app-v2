import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardProjectItem } from "@/types/dashboard";
import { Briefcase } from "lucide-react";

interface ProjectListProps {
  projects: DashboardProjectItem[];
  loading?: boolean;
}

export function ProjectList({ projects, loading }: ProjectListProps) {
  if (loading) {
     return <div className="animate-pulse h-64 bg-secondary rounded-lg" />;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Legaktívabb Projektek
        </CardTitle>
        <CardDescription>A kör legnépszerűbb projektjei</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nincs még aktivitás.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                   <p className="font-medium">{project.name}</p>
                </div>
                <div className="text-right">
                   <p className="font-semibold">{project.count} log</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
