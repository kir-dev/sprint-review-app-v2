import { PageHeader } from "@/components/PageHeader"
import { Users } from "lucide-react"

interface UsersHeaderProps {
  totalUsers: number
}

export function UsersHeader({ totalUsers }: UsersHeaderProps) {
  const description = `Felhasználói pozíciók és szerepkörök kezelése (${totalUsers} felhasználó)`

  return (
    <PageHeader
      title="Felhasználók"
      description={description}
      icon={Users}
    />
  )
}
