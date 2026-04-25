import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Download, FileText, Filter, Plus } from 'lucide-react';

interface LogsHeaderProps {
  onToggleFilters: () => void;
  onCreateLog: () => void;
  canExport?: boolean;
  onExport?: () => void;
}

export function LogsHeader({
  onToggleFilters,
  onCreateLog,
  canExport = false,
  onExport,
}: LogsHeaderProps) {
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
      {canExport && onExport && (
        <Button
          variant="outline"
          onClick={onExport}
          className="transition-all hover:scale-105 px-3 md:px-4"
          size="sm"
        >
          <Download className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Export</span>
        </Button>
      )}
      <Button
        onClick={onCreateLog}
        className="transition-all hover:scale-105 hidden md:flex"
      >
        <Plus className="h-4 w-4 mr-2" />
        Új Bejegyzés
      </Button>
    </PageHeader>
  );
}
