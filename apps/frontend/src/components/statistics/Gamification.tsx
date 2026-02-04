import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GamificationProps {
  data: {
    currentStreak: number;
    goal: {
       label: string;
       current: number;
       target: number;
       percentage: string;
    };
    largeTaskCount: number;
  };
}

export function Gamification({ data }: GamificationProps) {
  const goalPercent = parseFloat(data.goal.percentage);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Small delay to ensure render happens first then animation triggers
    const timer = setTimeout(() => setAnimatedProgress(goalPercent), 100);
    return () => clearTimeout(timer);
  }, [goalPercent]);

  return (
    <>
      <Card className="bg-orange-50/10 border-orange-200/20 break-inside-avoid mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-500">Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.currentStreak} Nap</div>
          <p className="text-xs text-muted-foreground">Folyamatos aktivitás</p>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Szemeszter Küldetés</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
             <div className="flex justify-between text-sm">
                <span>{data.goal.current} / {data.goal.target} óra</span>
                <span className="font-bold">{data.goal.percentage}%</span>
             </div>
          </div>
          <Progress value={animatedProgress} className="h-2 transition-all duration-1000 ease-out" />
          <p className="text-xs text-muted-foreground">
            {goalPercent >= 100 ? "Gratulálunk, teljesítetted a célt!" : "Csak így tovább!"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
