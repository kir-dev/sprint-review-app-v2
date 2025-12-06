'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Define strict color mapping for difficulties
// Define strict color mapping for difficulties (Matching Pie Chart Colors)
// Define strict color mapping for difficulties (Matching Pie Chart Colors)
const DIFFICULTY_COLORS: Record<string, string> = {
  SMALL: 'hsl(48, 96%, 60%)',    // Yellow (Matches SIMONYI)
  MEDIUM: 'hsl(32, 95%, 60%)',    // Orange-Yellow (Matches RESPONSIBILITY)
  LARGE: 'hsl(14, 100%, 60%)',     // Primary Orange (Matches PROJECT)
};

const DIFFICULTY_LABELS: Record<string, string> = {
  SMALL: 'Kicsi',
  MEDIUM: 'Közepes',
  LARGE: 'Nagy',
};

interface DifficultyBreakdownProps {
    data: { name: string; value: number }[];
    loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover p-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
           <span className="text-[0.70rem] uppercase text-muted-foreground">
                {DIFFICULTY_LABELS[label] || label}
            </span>
            <div className="font-bold text-muted-foreground">
                {payload[0].value} feladat
            </div>
        </div>
      );
    }
    return null;
};

export function DifficultyBreakdown({ data, loading }: DifficultyBreakdownProps) {
    if (loading) {
        return <div className="animate-pulse h-64 bg-secondary rounded-lg" />;
    }
    
    // Sort logic? Hard to Easy (LARGE -> SMALL) as requested
    const order = ['LARGE', 'MEDIUM', 'SMALL'];
    const chartData = data
        .filter(d => d.value > 0)
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feladat Nehézség</CardTitle>
                <CardDescription>Elvégzett feladatok megoszlása</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={80} 
                                tickFormatter={(val) => DIFFICULTY_LABELS[val] || val}
                                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </CardContent>
        </Card>
    )
}
