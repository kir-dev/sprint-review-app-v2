"use client"

import { useState } from "react"
import { toast } from "sonner"
import { GITHUB_API_BASE_URL } from "../constants"
import { useAuth } from "@/context/AuthContext"
import { ProfileFormData } from "../types"

/**
 * Simulates uploading an image file.
 * In a real-world application, this function would send the file to a backend
 * endpoint (e.g., multipart/form-data) which would then store it in a cloud
 * storage service (like AWS S3 or Google Cloud Storage) and return the public URL.
 * 
 * For this refactoring, we'll return a Base64 data URL. This is NOT recommended
 * for production as it bloats the user data payload.
 */
async function simulateImageUpload(imageFile: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}


export function useProfileMutations() {
  const { token, refreshUser, user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isValidatingGithub, setIsValidatingGithub] = useState(false)

  const validateGithubUsername = async (username: string): Promise<boolean> => {
    if (!username?.trim()) {
      return true // Don't validate if empty, it's optional
    }

    setIsValidatingGithub(true)
    try {
      const response = await fetch(`${GITHUB_API_BASE_URL}/users/${username.trim()}`)
      if (response.ok) {
        toast.success("✓ GitHub user found")
        return true
      }
      if (response.status === 404) {
        toast.error("GitHub user not found")
        return false
      }
      toast.error("Could not verify GitHub username")
      return false
    } catch (error) {
      console.error("Error validating GitHub username:", error)
      toast.error("Error checking GitHub username")
      return false
    } finally {
      setIsValidatingGithub(false)
    }
  }

  const updateUserProfile = async (data: ProfileFormData) => {
    if (!token || !user?.id) return

    // Pre-validation before attempting to save
    if (data.githubUsername?.trim()) {
      const isGithubValid = await validateGithubUsername(data.githubUsername);
      if (!isGithubValid) {
        toast.error("Please enter a valid GitHub username before saving.");
        return false;
      }
    }

    setIsSaving(true)
    try {
        let imageUrlToSave: string | null | undefined = data.profileImage;
        
        if (data.profileImage instanceof File) {
            imageUrlToSave = await simulateImageUpload(data.profileImage);
        }

      const payload = {
        simonyiEmail: data.simonyiEmail?.trim() || null,
        githubUsername: data.githubUsername?.trim() || null,
        profileImage: imageUrlToSave,
      };

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        await refreshUser()
        return true
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update profile")
        return false
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Failed to update profile. Please try again.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    isValidatingGithub,
    validateGithubUsername,
    updateUserProfile,
  }
}
