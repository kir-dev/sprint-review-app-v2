import { Users } from "lucide-react"

interface UsersHeaderProps {
  totalUsers: number
}

export function UsersHeader({ totalUsers }: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between animate-slide-in-top">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 transition-transform">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user positions and roles ({totalUsers}{" "}
            {totalUsers === 1 ? "user" : "users"})
          </p>
        </div>
      </div>
    </div>
  )
}
