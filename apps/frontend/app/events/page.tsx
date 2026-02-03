"use client"

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { ErrorAlert } from "@/components/ErrorAlert"
import { MobileFloatingActionButton } from "@/components/MobileFloatingActionButton"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
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

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<number | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/login")
    }
  }, [token, isAuthLoading, router])

  // Handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formData.endDate && formData.startDate > formData.endDate) {
      setError("A befejezés dátuma nem lehet korábbi a kezdés dátumánál.")
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      type: formData.type,
    }

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events"
      const method = editingEvent ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await loadData()
        closeDialog()
      } else {
        const error = await response.json()
        setError(error.message || "Nem sikerült menteni az eseményt")
      }
    } catch (err) {
      console.error("Error saving event:", err)
      setError("Nem sikerült menteni az eseményt. Próbáld újra.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDeleteClick(id: number) {
    setEventToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!eventToDelete) return
    // NOTE: We could add a separate isDeleting state here for the confirmation dialog
    try {
      const response = await fetch(`/api/events/${eventToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventToDelete))
        setDeleteConfirmOpen(false)
        setEventToDelete(null)
      } else {
        setError("Nem sikerült törölni az eseményt")
      }
    } catch (err) {
      console.error("Error deleting event:", err)
      setError("Nem sikerült törölni az eseményt. Próbáld újra.")
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
        <p>Betöltés...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
      <EventsHeader onCreateEvent={() => openDialog()} />

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
        isPending={isSubmitting}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Esemény Törlése"
        description="Biztosan törölni szeretnéd ezt az eseményt? Ez a művelet nem visszavonható."
      />

      {!isDialogOpen && !deleteConfirmOpen && (
        <MobileFloatingActionButton onClick={() => openDialog()} />
      )}
    </div>

  )
}
