import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

interface StatsCardsProps {
  totalLogs: number
  totalHours: number
  avgHours: number
}

export function StatsCards({ totalLogs, totalHours, avgHours }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="animate-slide-in-left hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground animate-bounce-slow" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300">{totalLogs}</div>
        </CardContent>
      </Card>

      <Card className="animate-slide-in-bottom hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animation-delay-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground animate-pulse-slow" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300">{totalHours}h</div>
        </CardContent>
      </Card>

      <Card className="animate-slide-in-right hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animation-delay-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg per Log</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground animate-spin-slow" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300">{avgHours}h</div>
        </CardContent>
      </Card>
    </div>
  )
}