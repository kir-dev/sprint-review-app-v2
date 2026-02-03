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
      <CardHeader className="pr-12 md:pr-14">
        <CardTitle className="text-lg md:text-xl font-semibold leading-tight">{log.description}</CardTitle>
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
            {new Date(log.date).toLocaleDateString('hu-HU')}
          </span>
          {log.timeSpent && (
            <span className="flex items-center gap-1.5 transition-all hover:text-foreground">
              <Clock className="h-3.5 w-3.5" />
              {log.timeSpent}h
            </span>
          )}
        </div>
      </CardContent>

      {/* Actions - Absolute positioned top right */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-card/80 backdrop-blur-sm rounded-md p-0.5 shadow-sm md:bg-transparent md:backdrop-blur-none md:shadow-none">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(log)}
          className="transition-all hover:scale-110 h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(log.id)}
          className="transition-all hover:scale-110 h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  )
}
