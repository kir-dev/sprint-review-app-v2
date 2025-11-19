import { Users } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface UsersHeaderProps {
  totalUsers: number
}

export function UsersHeader({ totalUsers }: UsersHeaderProps) {
  const description = `Manage user positions and roles (${totalUsers} ${
    totalUsers === 1 ? "user" : "users"
  })`

  return (
    <PageHeader
      title="Users"
      description={description}
      icon={Users}
    />
  )
}
