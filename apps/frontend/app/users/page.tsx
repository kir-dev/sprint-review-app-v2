"use client"

import { ErrorAlert } from "@/components/ErrorAlert"
import { useAuth } from "@/context/AuthContext"
import { updateUserPosition } from "@/lib/api/users"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Position } from "../logs/types"
import { UsersHeader } from "./components/UsersHeader"
import { UsersList } from "./components/UsersList"
import { UsersPageSkeleton } from "./components/UsersPageSkeleton"
import { useUserData } from "./hooks/useUserData"

export default function UsersPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()

  const {
    users,
    setUsers,
    isLoading: isLoadingUsers,
    error,
    setError,
  } = useUserData(token)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login")
    }
  }, [token, isLoading, router])

  async function handlePositionChange(userId: number, newPosition: Position) {
    if (!token) {
      setError("Authentication token not found. Please log in again.")
      return
    }
    try {
      const updatedUser = await updateUserPosition(userId, newPosition, token)
      // Preserve the _count field from the original user
      setUsers(
        users.map(u =>
          u.id === userId ? { ...updatedUser, _count: u._count } : u,
        ),
      )
      setError(null)
    } catch (err: any) {
      console.error("Error updating user position:", err)
      setError(err.message || "Failed to update user position. Please try again.")
    }
  }

  // Loading state
  if (isLoading || !user) {
    return <UsersPageSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <UsersHeader totalUsers={users.length} />

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <UsersList
        users={users}
        isLoading={isLoadingUsers}
        onPositionChange={handlePositionChange}
        currentUser={user}
      />
    </div>
  )
}
