import { Users } from "lucide-react"

interface UsersHeaderProps {
  totalUsers: number
}

export function UsersHeader({ totalUsers }: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between animate-slide-in-top">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage user positions and roles ({totalUsers} {totalUsers === 1 ? 'user' : 'users'})
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="p-3 rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
