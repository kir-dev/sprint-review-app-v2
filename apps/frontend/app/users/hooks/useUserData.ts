import { useEffect, useState } from "react"
import { User } from "../types"

export function useUserData(token: string | null) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadUsers() {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        setError(null)
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  return {
    users,
    setUsers,
    isLoading,
    error,
    setError,
    loadUsers,
  }
}
