import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Edit2, Trash2 } from "lucide-react"
import { categoryColors, categoryLabels, difficultyLabels } from "../constants"
import { Log } from "../types"

interface LogItemProps {
  log: Log
  onEdit: (log: Log) => void
  onDelete: (id: number) => void
}

export function LogItem({ log, onEdit, onDelete }: LogItemProps) {
  return (
    <Card className="hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] animate-fade-in group relative overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pr-2 md:pr-14">
        <CardTitle className="text-lg md:text-xl font-semibold leading-tight pt-1 wrap-break-word min-w-0">
          {log.description}
        </CardTitle>
        
        {/* Actions */}
        <div className="flex shrink-0 gap-1 md:absolute md:top-4 md:right-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(log)}
            className="h-8 w-8 p-0 hover:scale-110 transition-transform"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(log.id)}
            className="h-8 w-8 p-0 hover:scale-110 transition-transform"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs font-medium rounded-md border ${categoryColors[log.category]} transition-all hover:scale-105`}>
            {categoryLabels[log.category]}
          </span>
          {log.difficulty && log.category === 'PROJECT' && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-muted transition-all hover:scale-105">
              {difficultyLabels[log.difficulty]}
            </span>
          )}
          {log.project && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-pink-500/10 text-pink-500 transition-all hover:scale-105">
              {log.project.name}
            </span>
          )}
          {log.event && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-500 transition-all hover:scale-105">
              {log.event.name}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 transition-all hover:text-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(log.date).toLocaleDateString('hu-HU', { timeZone: 'Europe/Budapest' })}
          </span>
          {log.timeSpent && (
            <span className="flex items-center gap-1.5 transition-all hover:text-foreground">
              <Clock className="h-3.5 w-3.5" />
              {log.timeSpent}h
            </span>
          )}
        </div>
      </CardContent>


    </Card>
  )
}
