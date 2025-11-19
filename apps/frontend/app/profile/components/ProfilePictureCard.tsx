"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, User } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { ALLOWED_IMAGE_TYPES, MAX_PROFILE_IMAGE_SIZE_BYTES, MAX_PROFILE_IMAGE_SIZE_MB } from "../constants"
import { ProfileFormData } from "../types"

export function ProfilePictureCard() {
  const { watch, setValue } = useFormContext<ProfileFormData>()
  const profileImageValue = watch("profileImage")
  
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof profileImageValue === 'string') {
      setPreview(profileImageValue)
    } else if (profileImageValue instanceof File) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(profileImageValue)
    } else if (profileImageValue === null) {
      setPreview(null)
    }
  }, [profileImageValue])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Please select a valid image file (${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')})`)
        return
      }
      
      if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
        toast.error(`Image size must be less than ${MAX_PROFILE_IMAGE_SIZE_MB}MB`)
        return
      }

      setValue("profileImage", file, { shouldDirty: true })
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click()
  }

  return (
    <Card className="animate-slide-in-top hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload your profile photo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          <div 
            className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all"
            onClick={handleImageClick}
          >
            {preview ? (
              <Image src={preview} alt="Profile Preview" fill className="object-cover" />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleImageClick}
              className="w-full sm:w-auto"
            >
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, GIF or WEBP. Max {MAX_PROFILE_IMAGE_SIZE_MB}MB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
