import { Button } from "@/components/ui/button"
import { CalendarDays, Plus } from "lucide-react"

interface EventsHeaderProps {
  onCreateEvent: () => void
}

export function EventsHeader({ onCreateEvent }: EventsHeaderProps) {
  return (
    <div className="flex items-center justify-between animate-slide-in-top">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 transition-transform">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage Kir-Dev and Simonyi events</p>
        </div>
      </div>
      <Button 
        onClick={onCreateEvent}
        className="gap-2 hover:scale-105 transition-transform"
      >
        <Plus className="h-4 w-4" />
        New Event
      </Button>
    </div>
  )
}
