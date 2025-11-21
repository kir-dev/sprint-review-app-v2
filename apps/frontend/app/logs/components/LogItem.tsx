import { Button } from "@/components/ui/button"
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
    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
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
          
          <p className="text-sm transition-all">{log.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 transition-all hover:text-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(log.date).toLocaleDateString('hu-HU')}
            </span>
            {log.timeSpent && (
              <span className="flex items-center gap-1 transition-all hover:text-foreground">
                <Clock className="h-3 w-3" />
                {log.timeSpent}h
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(log)}
            className="transition-all hover:scale-110"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(log.id)}
            className="transition-all hover:scale-110"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}
