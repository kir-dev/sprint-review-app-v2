import { Button } from "@/components/ui/button"
import { Filter, Plus } from "lucide-react"

interface LogsHeaderProps {
  onToggleFilters: () => void
  onCreateLog: () => void
}

export function LogsHeader({ onToggleFilters, onCreateLog }: LogsHeaderProps) {
  return (
    <div className="flex items-center justify-between animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Logs</h1>
        <p className="text-muted-foreground">Track your work hours and activities</p>
      </div>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onToggleFilters}
          className="transition-all hover:scale-105"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button 
          onClick={onCreateLog}
          className="transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Log
        </Button>
      </div>
    </div>
  )
}
