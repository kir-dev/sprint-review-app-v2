import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';

interface EventsHeaderProps {
  canManage: boolean;
  onCreateEvent: () => void;
}

export function EventsHeader({ canManage, onCreateEvent }: EventsHeaderProps) {
  return (
    <PageHeader
      title="Események"
      description="Kir-Dev és Simonyi események kezelése"
      icon={CalendarDays}
    >
      {canManage && (
        <Button
          onClick={onCreateEvent}
          className="gap-2 hover:scale-105 transition-transform hidden md:flex"
        >
          <Plus className="h-4 w-4" />
          Új Esemény
        </Button>
      )}
    </PageHeader>
  );
}
