import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";

interface WorkPeriodProgressProps {
  currentPeriod: {
    startDate: string;
    endDate: string;
    name: string;
  } | null;
  loading?: boolean;
}

export function WorkPeriodProgress({ currentPeriod, loading }: WorkPeriodProgressProps) {
    if (loading) {
     return <div className="animate-pulse h-24 bg-secondary rounded-lg" />;
  }
  
  if (!currentPeriod) {
    return null;
  }

  // Animation state
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  
  const start = new Date(currentPeriod.startDate).getTime();
  const end = new Date(currentPeriod.endDate).getTime();
  const now = new Date().getTime();
  
  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);
  
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{currentPeriod.name}</CardTitle>
            <span className="text-xs text-muted-foreground">{daysLeft} nap van hátra</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${animatedProgress}%` }} 
            />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{new Date(currentPeriod.startDate).toLocaleDateString('hu-HU')}</span>
            <span>{Math.round(progress)}%</span>
            <span>{new Date(currentPeriod.endDate).toLocaleDateString('hu-HU')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
