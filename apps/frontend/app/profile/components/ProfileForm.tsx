"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useProfileMutations } from "../hooks/useProfileMutations"
import { ProfileFormData, profileSchema } from "../types"
import { AccountInfoCard } from "./AccountInfoCard"
import { AdditionalInfoCard } from "./AdditionalInfoCard"
import { ProfilePictureCard } from "./ProfilePictureCard"

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
    resolver: zodResolver(profileSchema as any) as any,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <ProfilePictureCard />
        <AccountInfoCard user={user!} />
        <AdditionalInfoCard
          control={control}
          isValidatingGithub={isValidatingGithub}
          onVerifyGithub={validateGithubUsername}
          githubUsernameValue={githubUsernameValue!}
        />
        
        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || !isDirty}
            className="w-full sm:w-auto hover:scale-105 transition-transform"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            className="w-full sm:w-auto gap-2 hover:scale-105 transition-transform"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Mentés..." : "Változtatások Mentése"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
