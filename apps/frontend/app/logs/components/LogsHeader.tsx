import { Button } from "@/components/ui/button"
import { FileText, Filter, Plus } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface LogsHeaderProps {
  onToggleFilters: () => void
  onCreateLog: () => void
}

export function LogsHeader({ onToggleFilters, onCreateLog }: LogsHeaderProps) {
  return (
    <PageHeader
      title="Work Logs"
      description="Track your work hours and activities"
      icon={FileText}
    >
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
    </PageHeader>
  )
}
