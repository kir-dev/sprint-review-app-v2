'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Camera, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import {
    ALLOWED_IMAGE_TYPES,
    MAX_PROFILE_IMAGE_SIZE_BYTES,
    MAX_PROFILE_IMAGE_SIZE_MB,
} from '../constants';
import { ProfileFormData } from '../types';

export function ProfilePictureCard() {
  const { watch, setValue } = useFormContext<ProfileFormData>();
  const profileImageValue = watch('profileImage');

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof profileImageValue === 'string') {
      setPreview(profileImageValue);
    } else if (profileImageValue instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(profileImageValue);
    } else if (profileImageValue === null) {
      setPreview(null);
    }
  }, [profileImageValue]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          `Kérjük, válassz érvényes képfájlt (${ALLOWED_IMAGE_TYPES.map((t) => t.split('/')[1]).join(', ')})`,
        );
        return;
      }

      if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
        toast.error(
          `A kép mérete nem lehet nagyobb, mint ${MAX_PROFILE_IMAGE_SIZE_MB}MB`,
        );
        return;
      }

      setValue('profileImage', file, { shouldDirty: true });
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  return (
    <Card className="animate-slide-in-top hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Profilkép</CardTitle>
        <CardDescription>Töltsd fel a profilképed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div
            className="relative h-24 w-24 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all shrink-0"
            onClick={handleImageClick}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Profilkép előnézet"
                fill
                className="object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-foreground" />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleImageClick}
              className="w-full sm:w-auto"
            >
              <Camera className="h-4 w-4 mr-2" />
              Fotó Feltöltése
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, GIF vagy WEBP. Max {MAX_PROFILE_IMAGE_SIZE_MB}MB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
