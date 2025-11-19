import { Button } from "@/components/ui/button"
import { CalendarDays, Plus } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface EventsHeaderProps {
  onCreateEvent: () => void
}

export function EventsHeader({ onCreateEvent }: EventsHeaderProps) {
  return (
    <PageHeader
      title="Events"
      description="Manage Kir-Dev and Simonyi events"
      icon={CalendarDays}
    >
      <Button 
        onClick={onCreateEvent}
        className="gap-2 hover:scale-105 transition-transform"
      >
        <Plus className="h-4 w-4" />
        New Event
      </Button>
    </PageHeader>
  )
}
