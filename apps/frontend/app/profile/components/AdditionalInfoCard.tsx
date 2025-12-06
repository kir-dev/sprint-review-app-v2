'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Github, Mail } from 'lucide-react';
import { Control, Controller, ControllerFieldState } from 'react-hook-form';
import { ProfileFormData } from '../types';

interface AdditionalInfoCardProps {
  control: Control<ProfileFormData>;
  isValidatingGithub: boolean;
  onVerifyGithub: (username: string) => void;
  githubUsernameValue: string;
}

const getFieldClass = (fieldState: ControllerFieldState) => {
  if (fieldState.isDirty) {
    return 'bg-amber-500/10 dark:bg-amber-500/20';
  }
  return '';
};

export function AdditionalInfoCard({
  control,
  isValidatingGithub,
  onVerifyGithub,
  githubUsernameValue,
}: AdditionalInfoCardProps) {
  return (
    <Card className="animate-slide-in-right hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>Update your optional profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simonyi Email */}
        <Controller
          name="simonyiEmail"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <label
                htmlFor="simonyiEmail"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                Simonyi Email
              </label>
              <Input
                {...field}
                id="simonyiEmail"
                type="email"
                placeholder="your.name@simonyi.bme.hu"
                className={getFieldClass(fieldState)}
                value={field.value ?? ''}
              />
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
              {!fieldState.error && (
                <p className="text-xs text-muted-foreground">
                  Your @simonyi.bme.hu email address
                </p>
              )}
            </div>
          )}
        />

        {/* GitHub Username */}
        <Controller
          name="githubUsername"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <label
                htmlFor="github"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
                GitHub Username
              </label>
              <div className="flex gap-2">
                <Input
                  {...field}
                  id="github"
                  type="text"
                  placeholder="Enter your GitHub username"
                  className={getFieldClass(fieldState)}
                  value={field.value ?? ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onVerifyGithub(githubUsernameValue)}
                  disabled={isValidatingGithub || !githubUsernameValue?.trim()}
                  className="shrink-0"
                >
                  {isValidatingGithub ? 'Checking...' : 'Verify'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your GitHub username for project integration
              </p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
