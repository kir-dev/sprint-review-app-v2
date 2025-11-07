"use client"

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { ErrorAlert } from "@/components/ErrorAlert"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { EventDialog } from "./components/EventDialog"
import { EventsHeader } from "./components/EventsHeader"
import { EventsList } from "./components/EventsList"
import { useEventData } from "./hooks/useEventData"
import { useEventForm } from "./hooks/useEventForm"

export default function EventsPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  // Custom hooks
  const { events, setEvents, isLoading, error, setError, loadData } = useEventData(token)
  const { isDialogOpen, editingEvent, formData, setFormData, openDialog, closeDialog } = useEventForm()

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<number | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login')
    }
  }, [token, isAuthLoading, router])

  // Handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      date: formData.date,
      type: formData.type,
    }

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await loadData()
        closeDialog()
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to save event')
      }
    } catch (err) {
      console.error('Error saving event:', err)
      setError('Failed to save event. Please try again.')
    }
  }

  function handleDeleteClick(id: number) {
    setEventToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!eventToDelete) return

    try {
      const response = await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventToDelete))
        setDeleteConfirmOpen(false)
        setEventToDelete(null)
      } else {
        setError('Failed to delete event')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event. Please try again.')
    }
  }

  function handleDeleteCancel() {
    setDeleteConfirmOpen(false)
    setEventToDelete(null)
  }

  // Loading state
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <EventsHeader 
        onCreateEvent={() => openDialog()}
      />

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <EventsList
        events={events}
        isLoading={isLoading}
        onCreateEvent={() => openDialog()}
        onEditEvent={openDialog}
        onDeleteEvent={handleDeleteClick}
      />

      <EventDialog
        isOpen={isDialogOpen}
        editingEvent={editingEvent}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  )
}
