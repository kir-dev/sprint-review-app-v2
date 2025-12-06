import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, FileText } from 'lucide-react';

interface LogStatisticsProps {
  data: {
    totalLogs: number;
    largeCount: number;
    difficultyBreakdown: { name: string; value: number }[];
    logsByDifficulty?: Record<string, number>; // fallback
  };
}

export function LogStatistics({ data }: LogStatisticsProps) {
  const difficultyMap = {
    SMALL: 'Kicsi',
    MEDIUM: 'Közepes',
    LARGE: 'Nagy',
  };

  const getDifficultyCount = (diff: string) => {
    const item = data.difficultyBreakdown.find(d => d.name === diff);
    return item ? item.value : 0;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Összes Bejegyzés</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalLogs}</div>
          <p className="text-xs text-muted-foreground">Ebben a periódusban</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nagy Feladatok</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.largeCount}</div>
          <p className="text-xs text-muted-foreground">Komplex problémák megoldva</p>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
         <CardHeader>
            <CardTitle>Nehézségi Szintek</CardTitle>
         </CardHeader>
         <CardContent className="flex justify-around items-center">
            <div className="text-center">
                <div className="text-xl font-bold text-green-500">{getDifficultyCount('SMALL')}</div>
                <div className="text-xs text-muted-foreground">Kicsi</div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-center">
                <div className="text-xl font-bold text-yellow-500">{getDifficultyCount('MEDIUM')}</div>
                <div className="text-xs text-muted-foreground">Közepes</div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-center">
                <div className="text-xl font-bold text-red-500">{getDifficultyCount('LARGE')}</div>
                <div className="text-xs text-muted-foreground">Nagy</div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
