import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { FileText, Filter, Plus } from "lucide-react"

interface LogsHeaderProps {
  onToggleFilters: () => void
  onCreateLog: () => void
}

export function LogsHeader({ onToggleFilters, onCreateLog }: LogsHeaderProps) {
  return (
    <PageHeader
      title="Munkanapló"
      description="Kövesd nyomon a munkaóráidat és tevékenységeidet"
      icon={FileText}
    >
      <Button 
        variant="outline" 
        onClick={onToggleFilters}
        className="transition-all hover:scale-105 px-3 md:px-4"
        size="sm"
      >
        <Filter className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Szűrők</span>
      </Button>
      <Button 
        onClick={onCreateLog}
        className="transition-all hover:scale-105 hidden md:flex"
      >
        <Plus className="h-4 w-4 mr-2" />
        Új Bejegyzés
      </Button>
    </PageHeader>
  )
}
