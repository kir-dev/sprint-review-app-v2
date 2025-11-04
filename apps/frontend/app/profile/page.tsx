"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { Github, Mail, Save, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, token, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [githubUsername, setGithubUsername] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login')
      return
    }

    if (user) {
      setGithubUsername(user.githubUsername || "")
    }
  }, [isLoading, token, router, user])

  async function handleSave() {
    if (!token || !user?.id) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: githubUsername.trim() || null,
        }),
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Refresh user data from backend
        await refreshUser()
      } else {
        const error = await response.json()
        setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !token) {
    return null
  }

  return (
    <div className="flex justify-center items-start max-w-7xl min-h-screen p-8">
      <div className="flex flex-col gap-6 w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Information from AuthSCH (cannot be edited here)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {user.fullName}
              </div>
              <p className="text-xs text-muted-foreground">
                Managed by AuthSCH
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {user.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Managed by AuthSCH
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Update your optional profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GitHub Username */}
          <div className="space-y-2">
            <label htmlFor="github" className="text-sm font-medium flex items-center gap-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              GitHub Username
            </label>
            <input
              id="github"
              type="text"
              placeholder="Enter your GitHub username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Your GitHub username for project integration
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setGithubUsername(user.githubUsername || "")}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Stats</CardTitle>
          <CardDescription>
            Your contribution summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Hours Logged</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
