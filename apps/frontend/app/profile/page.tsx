"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { positionLabels } from "@/lib/positions"
import { Camera, Github, Loader2, LogOut, Mail, Save, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, token, isLoading, refreshUser, logout } = useAuth()
  const router = useRouter()
  const [githubUsername, setGithubUsername] = useState("")
  const [simonyiEmail, setSimonyiEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isValidatingGithub, setIsValidatingGithub] = useState(false)
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
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click()
  }

  async function validateGithubUsername(username: string): Promise<boolean> {
    if (!username.trim()) {
      return true
    }

    setIsValidatingGithub(true)

    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}`)
      
      if (response.ok) {
        toast.success('✓ GitHub user found')
        return true
      } else if (response.status === 404) {
        toast.error('GitHub user not found')
        return false
      } else {
        toast.error('Could not verify GitHub username')
        return false
      }
    } catch (error) {
      console.error('Error validating GitHub username:', error)
      toast.error('Error checking GitHub username')
      return false
    } finally {
      setIsValidatingGithub(false)
    }
  }

  async function handleSave() {
    if (!token || !user?.id) return

    // Validate Simonyi email if provided
    if (simonyiEmail.trim() && !simonyiEmail.endsWith('@simonyi.bme.hu')) {
      toast.error('Simonyi email must end with @simonyi.bme.hu')
      return
    }

    // Validate GitHub username if provided
    if (githubUsername.trim()) {
      const isValidGithub = await validateGithubUsername(githubUsername)
      if (!isValidGithub) {
        toast.error('Please enter a valid GitHub username')
        return
      }
    }


    setIsSaving(true)

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
        toast.success('Profile updated successfully!')
        // Refresh user data from backend
        await refreshUser()
        // Clear the imageFile after successful save
        setImageFile(null)
        // Reset changed flags
        setGithubChanged(false)
        setSimonyiEmailChanged(false)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile. Please try again.')
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
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

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
                  <Image src={profileImage} alt="Profile" fill className="object-cover" />
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
                <Input value={user.fullName} readOnly disabled />
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
                <Input value={user.email} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Managed by AuthSCH
                </p>
              </div>
            </div>

            {/* Position Badge */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">
                Position
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {positionLabels[user.position]}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Your current position in the organization
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
              <Input
                id="simonyiEmail"
                type="email"
                placeholder="your.name@simonyi.bme.hu"
                value={simonyiEmail}
                onChange={(e) => {
                  setSimonyiEmail(e.target.value)
                  setSimonyiEmailChanged(true)
                }}
                className={`${
                  simonyiEmailChanged ? 'bg-highlight' : ''
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
                <Input
                  id="github"
                  type="text"
                  placeholder="Enter your GitHub username"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(e.target.value)
                    setGithubChanged(true)
                  }}
                  className={`${
                    githubChanged ? 'bg-highlight' : ''
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
              <p className="text-xs text-muted-foreground">
                Your GitHub username for project integration
              </p>
            </div>

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
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
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
  )
}
