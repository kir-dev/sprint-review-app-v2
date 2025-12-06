'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBreakdownData } from "@/types/dashboard";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryBreakdownProps {
  data: (CategoryBreakdownData & { [key: string]: any })[];
  loading?: boolean;
}

// Specific colors for categories matching Visualizations.tsx
const CATEGORY_COLORS: Record<string, string> = {
  PROJECT: 'hsl(14, 100%, 60%)',        // Primary Orange
  RESPONSIBILITY: 'hsl(32, 95%, 60%)',  // Orange-Yellow
  EVENT: 'hsl(0, 0%, 40%)',             // Gray
  MAINTENANCE: 'hsl(14, 80%, 40%)',     // Darker Primary
  SIMONYI: 'hsl(48, 96%, 60%)',         // Yellow
  OTHER: 'hsl(0, 0%, 70%)',             // Light Gray
};

const CATEGORY_LABELS: Record<string, string> = {
  PROJECT: 'Projekt',
  RESPONSIBILITY: 'Felelősség',
  EVENT: 'Esemény',
  MAINTENANCE: 'Karbantartás',
  SIMONYI: 'Simonyi',
  OTHER: 'Egyéb',
};

const DEFAULT_COLOR = 'hsl(0, 0%, 50%)';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const name = payload[0].payload.translatedName || payload[0].name || label;
      return (
        <div key={name} className="rounded-lg border bg-popover p-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {name}
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].value.toFixed(1)} óra
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

export function CategoryBreakdown({ data, loading }: CategoryBreakdownProps) {
  if (loading) {
    return <div className="animate-pulse h-80 bg-secondary rounded-lg" />;
  }

  // Filter out zero values
  const chartData = data.filter(d => d.value > 0).map(item => ({
    ...item,
    translatedName: CATEGORY_LABELS[item.name] || item.name
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Kategória Megoszlás</CardTitle>
        <CardDescription>Minden felhasználó összesített aktivitása</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
           <div className="h-64 flex items-center justify-center text-muted-foreground">
             Nincs adat.
           </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="translatedName"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
                        stroke="var(--color-card)" 
                        strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                    content={<CustomTooltip />} 
                    wrapperStyle={{ outline: 'none' }}
                    isAnimationActive={false}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
