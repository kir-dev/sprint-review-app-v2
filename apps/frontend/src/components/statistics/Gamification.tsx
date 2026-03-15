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
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const current = data.goal.current;
  const target = data.goal.target || 60;
  const rawPercentage = (current / target) * 100;

  const maxLevels = 4;

  const levelColors = [
    'bg-primary',
    'bg-yellow-500',
    'bg-cyan-400',
    'bg-emerald-500',
  ];

  useEffect(() => {
    // Small delay to ensure render happens first then animation triggers
    const timer = setTimeout(() => setAnimatedProgress(rawPercentage), 100);
    return () => clearTimeout(timer);
  }, [rawPercentage]);

  // If current is exactly a multiple of target, don't show the empty next bar unless it's 0
  let barsToShow = Math.ceil(current / target);
  if (barsToShow === 0) barsToShow = 1;
  barsToShow = Math.min(barsToShow, maxLevels);

  return (
    <>
      <Card className="bg-orange-50/10 border-orange-200/20 break-inside-avoid mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-500">
            Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.currentStreak} Nap</div>
          <p className="text-xs text-muted-foreground">Folyamatos aktivitás</p>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Szemeszter Küldetés
          </CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-sm">
              <span>
                {current} / {target} óra
              </span>
              <span className="font-bold">{rawPercentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: barsToShow }).map((_, index) => {
              const barValue = Math.max(
                0,
                Math.min(100, animatedProgress - index * 100),
              );

              return (
                <Progress
                  key={index}
                  value={barValue}
                  className="h-2"
                  indicatorClassName={levelColors[index % levelColors.length]}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {rawPercentage >= 100
              ? 'Gratulálunk, teljesítetted a célt!'
              : 'Csak így tovább!'}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
