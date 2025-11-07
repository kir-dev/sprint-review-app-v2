import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import React from "react"
import { eventTypeLabels } from "../constants"
import { EventFormData, EventType } from "../types"

interface EventDialogProps {
  isOpen: boolean
  editingEvent: { id: number; name: string; date: string; type: EventType } | null
  formData: EventFormData
  onFormDataChange: (data: EventFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function EventDialog({
  isOpen,
  editingEvent,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
}: EventDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto my-8 animate-slide-in-bottom">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Event Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                placeholder="Enter event name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFormDataChange({ ...formData, date: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium">
                Event Type <span className="text-destructive">*</span>
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onFormDataChange({ ...formData, type: e.target.value as EventType })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              >
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>
                    {eventTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
