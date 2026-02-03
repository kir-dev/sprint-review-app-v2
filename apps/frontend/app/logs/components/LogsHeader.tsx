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
        className="transition-all hover:scale-105"
      >
        <Filter className="h-4 w-4 mr-2" />
        Szűrők
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
