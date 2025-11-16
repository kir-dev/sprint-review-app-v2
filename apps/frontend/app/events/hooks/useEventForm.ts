import { useState } from "react"
import { Event, EventFormData } from "../types"

export function useEventForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    startDate: '',
    endDate: '',
    type: '',
  })

  function openDialog(event?: Event) {
    if (event) {
      setEditingEvent(event)
      setFormData({
        name: event.name,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        type: event.type,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        type: 'KIR_DEV',
      })
    }
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingEvent(null)
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      type: '',
    })
  }

  return {
    isDialogOpen,
    editingEvent,
    formData,
    setFormData,
    openDialog,
    closeDialog,
  }
}
