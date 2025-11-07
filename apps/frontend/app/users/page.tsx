"use client"

import { ErrorAlert } from "@/components/ErrorAlert"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Position } from "../logs/types"
import { UsersHeader } from "./components/UsersHeader"
import { UsersList } from "./components/UsersList"
import { useUserData } from "./hooks/useUserData"

export default function UsersPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  
  const { users, setUsers, isLoading: isLoadingUsers, error, setError, loadUsers } = useUserData(token)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login')
    }
  }, [token, isLoading, router])

  async function handlePositionChange(userId: number, newPosition: Position) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: newPosition }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        // Preserve the _count field from the original user
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...updatedUser, _count: u._count } 
            : u
        ))
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update user position')
      }
    } catch (err) {
      console.error('Error updating user position:', err)
      setError('Failed to update user position. Please try again.')
    }
  }

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <UsersHeader totalUsers={users.length} />

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <UsersList
        users={users}
        isLoading={isLoadingUsers}
        onPositionChange={handlePositionChange}
      />
    </div>
  )
}
