import { useEffect, useState } from "react"
import { Event } from "../types"

export function useEventData(token: string | null) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setError(null)
      } else {
        setError('Failed to load events')
      }
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  return {
    events,
    setEvents,
    isLoading,
    error,
    setError,
    loadData,
  }
}
