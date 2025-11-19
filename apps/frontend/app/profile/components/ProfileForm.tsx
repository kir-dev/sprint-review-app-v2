"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/AuthContext"
import { profileSchema, ProfileFormData } from "../types"
import { useProfileMutations } from "../hooks/useProfileMutations"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { ProfilePictureCard } from "./ProfilePictureCard"
import { AccountInfoCard } from "./AccountInfoCard"
import { AdditionalInfoCard } from "./AdditionalInfoCard"

/**
 * Renders the main form content, wired up with react-hook-form.
 */
export function ProfileForm() {
  const { user } = useAuth()
  const { 
    isSaving, 
    isValidatingGithub, 
    validateGithubUsername, 
    updateUserProfile 
  } = useProfileMutations()

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      githubUsername: user?.githubUsername || "",
      simonyiEmail: user?.simonyiEmail || "",
      profileImage: user?.profileImage || null,
    },
  })

  const { handleSubmit, reset, control, watch, formState: { isDirty } } = methods
  const githubUsernameValue = watch("githubUsername")

  // Reset form with user data when it loads or changes
  useEffect(() => {
    if (user) {
      reset({
        githubUsername: user.githubUsername || "",
        simonyiEmail: user.simonyiEmail || "",
        profileImage: user.profileImage || null,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    await updateUserProfile(data)
  }

  const handleReset = () => {
    if (user) {
      reset({
        githubUsername: user.githubUsername || "",
        simonyiEmail: user.simonyiEmail || "",
        profileImage: user.profileImage || null,
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ProfilePictureCard />
        <AccountInfoCard user={user!} />
        <AdditionalInfoCard
          control={control}
          isValidatingGithub={isValidatingGithub}
          onVerifyGithub={validateGithubUsername}
          githubUsernameValue={githubUsernameValue!}
        />
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || !isDirty}
            className="hover:scale-105 transition-transform"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="gap-2 hover:scale-105 transition-transform"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
