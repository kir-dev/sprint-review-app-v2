"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"
import { PageShell } from "./components/PageShell"
import { LogoutCard } from "./components/LogoutCard"
import { ProfileForm } from "./components/ProfileForm"

/**
 * Main page component. Handles auth state, loading, and page layout.
 */
export default function ProfilePage() {
  const { user, token, isLoading, logout } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login")
    }
  }, [isLoading, token, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Render nothing until redirect is complete
  if (!user || !token) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <PageShell>
      <ProfileForm />
      <LogoutCard onLogout={handleLogout} />
    </PageShell>
  )
}
