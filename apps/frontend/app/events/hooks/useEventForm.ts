import { useState } from "react"
import { Event, EventFormData } from "../types"

export function useEventForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    type: '',
  })

  function openDialog(event?: Event) {
    if (event) {
      setEditingEvent(event)
      setFormData({
        name: event.name,
        date: event.date.split('T')[0],
        type: event.type,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
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
      date: '',
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
