import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CalendarDays, Edit2, FileText, Trash2 } from "lucide-react"
import { eventTypeColors, eventTypeLabels } from "../constants"
import { Event } from "../types"

interface EventsListProps {
  events: Event[]
  isLoading: boolean
  onCreateEvent: () => void
  onEditEvent: (event: Event) => void
  onDeleteEvent: (id: number) => void
}

export function EventsList({
  events,
  isLoading,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
}: EventsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-primary/20 mb-4" />
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="animate-slide-in-bottom">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first event to get started
          </p>
          <Button onClick={onCreateEvent} className="transition-all hover:scale-105">
            Create Event
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event, index) => {
        const eventDate = new Date(event.date)
        const formattedDate = eventDate.toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        return (
          <Card
            key={event.id}
            className="animate-slide-in-bottom hover:shadow-lg transition-all duration-300 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {event.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditEvent(event)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 transition-all hover:scale-110"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEvent(event.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium border",
                    eventTypeColors[event.type]
                  )}
                >
                  {eventTypeLabels[event.type]}
                </span>
              </div>

              {event._count && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <FileText className="h-3 w-3" />
                  <span>{event._count.logs} logs</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
