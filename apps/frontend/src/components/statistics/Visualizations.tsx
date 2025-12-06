'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface VisualizationsProps {
  breakdownData: {
    categoryBreakdown: { name: string; value: number }[];
  };
  historyData: {
    weeklyTrend: { date: string; hours: number }[];
    allTimeWeeklyTrend: { date: string; hours: number }[];
    monthlyTrend: { date: string; hours: number }[];
    workPeriodTrend: { name: string; hours: number }[];
    heatmap: { date: string; count: number }[];
  };
}

// Specific colors for categories
const CATEGORY_COLORS: Record<string, string> = {
  PROJECT: 'hsl(14, 100%, 60%)',        // Primary Orange (Requested)
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
      // Use localized name if available in payload
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

export function Visualizations({ breakdownData, historyData }: VisualizationsProps) {
  const [activeTab, setActiveTab] = useState('weekly');

  // Translate category names for display
  const translatedBreakdown = breakdownData.categoryBreakdown.map(item => ({
      ...item,
      translatedName: CATEGORY_LABELS[item.name] || item.name
  }));

  const formatData = (data: any[], type: 'weekly' | 'monthly' | 'workPeriod') => {
      if (!data) return [];
      return data.map(item => {
          let displayDate = item.name || item.date;
          if (type === 'weekly' || type === 'monthly') {
               const d = new Date(item.date);
               if (type === 'monthly') {
                   displayDate = d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
               } else {
                   displayDate = d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
               }
          }
          return {
              ...item,
              displayDate
          };
      });
  };

  const weeklyData = formatData(historyData.weeklyTrend, 'weekly');
  const monthlyData = formatData(historyData.monthlyTrend, 'monthly');
  const workPeriodData = formatData(historyData.workPeriodTrend, 'workPeriod');
  const allTimeData = formatData(historyData.allTimeWeeklyTrend, 'weekly');

  const getChartData = () => {
      switch(activeTab) {
          case 'weekly': return weeklyData;
          case 'monthly': return monthlyData;
          case 'workPeriod': return workPeriodData;
          case 'allTime': return allTimeData;
          default: return weeklyData;
      }
  }

  const chartData = getChartData();


  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Kategória Megoszlás (Órák)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="translatedName"
              >
                {translatedBreakdown.map((entry, index) => (
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
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <CardTitle>Aktivitás Trend</CardTitle>
                 {/* Tabs integrated here or just switcher logic */}
            </div>
            <CardDescription>
                A kiválasztott időszak aktivitása órákban
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Tabs defaultValue="weekly" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
              <div className="flex-1 h-[250px] w-full min-h-0 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                        dataKey="displayDate" 
                        stroke="var(--color-muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'var(--color-foreground)' }}
                        interval={activeTab === 'allTime' ? 'preserveStartEnd' : 0 } 
                    />
                    <YAxis 
                        stroke="var(--color-muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}ó`}
                        tick={{ fill: 'var(--color-foreground)' }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                        content={<CustomTooltip />}
                    />
                    <Bar 
                        dataKey="hours" 
                        name="Feldolgozott Órák" 
                        fill={CATEGORY_COLORS.PROJECT} 
                        radius={[4, 4, 0, 0]} 
                    />
                    </BarChart>
                </ResponsiveContainer>
              </div>

              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="weekly">Heti</TabsTrigger>
                <TabsTrigger value="monthly">Havi</TabsTrigger>
                <TabsTrigger value="workPeriod">Időszak</TabsTrigger>
                <TabsTrigger value="allTime">Mindent</TabsTrigger>
              </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
