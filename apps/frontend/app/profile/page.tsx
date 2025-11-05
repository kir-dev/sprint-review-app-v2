"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { Camera, Github, LogOut, Mail, Save, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function ProfilePage() {
  const { user, token, isLoading, refreshUser, logout } = useAuth()
  const router = useRouter()
  const [githubUsername, setGithubUsername] = useState("")
  const [simonyiEmail, setSimonyiEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isValidatingGithub, setIsValidatingGithub] = useState(false)
  const [githubValidationMessage, setGithubValidationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [githubChanged, setGithubChanged] = useState(false)
  const [simonyiEmailChanged, setSimonyiEmailChanged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login')
      return
    }

    if (user) {
      setGithubUsername(user.githubUsername || "")
      setSimonyiEmail(user.simonyiEmail || "")
      setProfileImage(user.profileImage || null)
      setGithubChanged(false)
      setSimonyiEmailChanged(false)
    }
  }, [isLoading, token, router, user])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage({ type: 'error', text: 'Please select an image file' })
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: 'Image size must be less than 5MB' })
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setSaveMessage(null)
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click()
  }

  async function validateGithubUsername(username: string): Promise<boolean> {
    if (!username.trim()) {
      setGithubValidationMessage(null)
      return true
    }

    setIsValidatingGithub(true)
    setGithubValidationMessage(null)

    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}`)
      
      if (response.ok) {
        setGithubValidationMessage({ type: 'success', text: '✓ GitHub user found' })
        // Clear message after 3 seconds
        setTimeout(() => {
          setGithubValidationMessage(null)
        }, 3000)
        return true
      } else if (response.status === 404) {
        setGithubValidationMessage({ type: 'error', text: 'GitHub user not found' })
        // Clear message after 3 seconds
        setTimeout(() => {
          setGithubValidationMessage(null)
        }, 3000)
        return false
      } else {
        setGithubValidationMessage({ type: 'error', text: 'Could not verify GitHub username' })
        // Clear message after 3 seconds
        setTimeout(() => {
          setGithubValidationMessage(null)
        }, 3000)
        return false
      }
    } catch (error) {
      console.error('Error validating GitHub username:', error)
      setGithubValidationMessage({ type: 'error', text: 'Error checking GitHub username' })
      // Clear message after 3 seconds
      setTimeout(() => {
        setGithubValidationMessage(null)
      }, 3000)
      return false
    } finally {
      setIsValidatingGithub(false)
    }
  }

  async function handleSave() {
    if (!token || !user?.id) return

    // Validate Simonyi email if provided
    if (simonyiEmail.trim() && !simonyiEmail.endsWith('@simonyi.bme.hu')) {
      setSaveMessage({ type: 'error', text: 'Simonyi email must end with @simonyi.bme.hu' })
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 8000)
      return
    }

    // Validate GitHub username if provided
    if (githubUsername.trim()) {
      const isValidGithub = await validateGithubUsername(githubUsername)
      if (!isValidGithub) {
        setSaveMessage({ type: 'error', text: 'Please enter a valid GitHub username' })
        // Clear error message after 5 seconds
        setTimeout(() => {
          setSaveMessage(null)
        }, 8000)
        return
      }
    }


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
          simonyiEmail: simonyiEmail.trim() || null,
          githubUsername: githubUsername.trim() || null,
          profileImage: profileImage || null,
        }),
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Clear message after 5 seconds
        setTimeout(() => {
          setSaveMessage(null)
        }, 5000)
        // Refresh user data from backend
        await refreshUser()
        // Clear the imageFile after successful save
        setImageFile(null)
        // Reset changed flags
        setGithubChanged(false)
        setSimonyiEmailChanged(false)
      } else {
        const error = await response.json()
        setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        // Clear error message after 5 seconds
        setTimeout(() => {
          setSaveMessage(null)
        }, 5000)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 5000)
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
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Profile Picture */}
        <Card className="animate-slide-in-top hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload your profile photo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all"
                   onClick={handleImageClick}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={handleImageClick}
                  className="w-full sm:w-auto"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="animate-slide-in-left hover:shadow-lg transition-shadow">
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

        {/* GitHub Username */}
        <Card className="animate-slide-in-right hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Update your optional profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* BME Email */}
            <div className="space-y-2">
              <label htmlFor="simonyiEmail" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Simonyi Email
              </label>
              <input
                id="simonyiEmail"
                type="email"
                placeholder="your.name@simonyi.bme.hu"
                value={simonyiEmail}
                onChange={(e) => {
                  setSimonyiEmail(e.target.value)
                  setSimonyiEmailChanged(true)
                }}
                className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  simonyiEmailChanged ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-background'
                }`}
              />
              <p className="text-xs text-muted-foreground">
                Your @simonyi.bme.hu email address
              </p>
            </div>

            {/* GitHub Username */}
            <div className="space-y-2">
              <label htmlFor="github" className="text-sm font-medium flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                GitHub Username
              </label>
              <div className="flex gap-2">
                <input
                  id="github"
                  type="text"
                  placeholder="Enter your GitHub username"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(e.target.value)
                    setGithubValidationMessage(null)
                    setGithubChanged(true)
                  }}
                  className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    githubChanged ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-background'
                  }`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => validateGithubUsername(githubUsername)}
                  disabled={isValidatingGithub || !githubUsername.trim()}
                  className="shrink-0"
                >
                  {isValidatingGithub ? 'Checking...' : 'Verify'}
                </Button>
              </div>
              {githubValidationMessage && (
                <p className={`text-xs ${
                  githubValidationMessage.type === 'success' 
                    ? 'text-green-500' 
                    : 'text-destructive'
                }`}>
                  {githubValidationMessage.text}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your GitHub username for project integration
              </p>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-4 rounded-lg animate-slide-in-top ${
                saveMessage.type === 'success' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setGithubUsername(user.githubUsername || "")
                  setSimonyiEmail(user.simonyiEmail || "")
                  setProfileImage(user.profileImage || null)
                  setGithubChanged(false)
                  setSimonyiEmailChanged(false)
                }}
                disabled={isSaving}
                className="hover:scale-105 transition-transform text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 hover:scale-105 transition-transform"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="animate-slide-in-bottom hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>
              Sign out from your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={logout}
              className="w-full gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
