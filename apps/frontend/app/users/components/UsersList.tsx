import { Card, CardContent } from "@/components/ui/card"
import {
    positionColors,
    positionLabels,
    positionSortOrder,
} from "@/lib/positions"
import { cn } from "@/lib/utils"
import { ChevronDown, Mail, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Position } from "../../logs/types"
import { User } from "../types"

interface UsersListProps {
  users: User[]
  isLoading: boolean
  onPositionChange: (userId: number, newPosition: Position) => Promise<void>
  currentUser: { position: Position } | null
}

export function UsersList({
  users,
  isLoading,
  onPositionChange,
  currentUser,
}: UsersListProps) {
  const [changingUserId, setChangingUserId] = useState<number | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  const canEditPosition =
    currentUser?.position === Position.KORVEZETO ||
    currentUser?.position === Position.KORVEZETO_HELYETTES

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aIndex = positionSortOrder.indexOf(a.position)
      const bIndex = positionSortOrder.indexOf(b.position)
      // If a position is not in the sort order list, it will have an index of -1
      // and should be placed at the end.
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [users])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setOpenDropdownId(null)
    }

    if (openDropdownId !== null) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [openDropdownId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-primary/20 mb-4" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="animate-slide-in-bottom">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-sm text-muted-foreground">
            Users will appear here once they register
          </p>
        </CardContent>
      </Card>
    )
  }

  async function handlePositionChange(userId: number, newPosition: Position) {
    setChangingUserId(userId)
    setOpenDropdownId(null)
    try {
      await onPositionChange(userId, newPosition)
    } finally {
      setChangingUserId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedUsers.map((user, index) => (
        <Card
          key={user.id}
          className="animate-slide-in-bottom hover:shadow-lg transition-all duration-300 group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="space-y-4 pt-6">
            {/* User Avatar and Info */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-primary">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/users/${user.id}`} className="block">
                  <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors hover:underline">
                    {user.fullName}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Position Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Position
              </label>
              <div className="relative">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setOpenDropdownId(
                      openDropdownId === user.id ? null : user.id,
                    )
                  }}
                  disabled={changingUserId === user.id || !canEditPosition}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                    positionColors[user.position],
                    (changingUserId === user.id || !canEditPosition) &&
                      "cursor-not-allowed",
                    changingUserId === user.id && "animate-pulse",
                    changingUserId !== user.id &&
                      canEditPosition &&
                      "hover:shadow-md",
                  )}
                >
                  <span>
                    {changingUserId === user.id
                      ? "Frissítés..."
                      : positionLabels[user.position]}
                  </span>
                  {canEditPosition && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openDropdownId === user.id && "rotate-180",
                      )}
                    />
                  )}
                </button>

                {/* Dropdown */}
                {openDropdownId === user.id &&
                  changingUserId !== user.id && (
                    <div
                      className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto animate-slide-in-bottom"
                      onClick={e => e.stopPropagation()}
                    >
                      {Object.values(Position).map(position => (
                        <button
                          key={position}
                          onClick={() => handlePositionChange(user.id, position)}
                          disabled={changingUserId === user.id}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                            positionColors[position],
                            user.position === position && "bg-accent/50",
                          )}
                        >
                          {positionLabels[position]}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Stats */}
            {user._count && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-4">
                  <span>{user._count.logs} logs</span>
                  <span>{user._count.projects} projects</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
