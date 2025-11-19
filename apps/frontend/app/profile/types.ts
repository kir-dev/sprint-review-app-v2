import { z } from 'zod';
import { SIMONYI_EMAIL_SUFFIX } from './constants';

// Copied from apps/frontend/app/logs/types.ts to avoid complex relative imports
export enum Position {
  UJONC = "UJONC",
  TAG = "TAG",
  HR_FELELOS = "HR_FELELOS",
  PR_FELELOS = "PR_FELELOS",
  TANFOLYAMFELELOS = "TANFOLYAMFELELOS",
  GAZDASAGIS = "GAZDASAGIS",
  KORVEZETO_HELYETTES = "KORVEZETO_HELYETTES",
  KORVEZETO = "KORVEZETO",
  OREGTAG = "OREGTAG",
  ARCHIVALT = "ARCHIVALT",
}

// Based on apps/frontend/src/context/AuthContext.tsx
export interface UserProfile {
  id: number;
  email: string;
  simonyiEmail?: string | null;
  fullName: string;
  authschId: string;
  githubUsername?: string | null;
  profileImage?: string | null;
  position: Position;
}

// Zod schema for form validation
export const profileSchema = z.object({
  simonyiEmail: z
    .string()
    .refine((email) => email === '' || email.endsWith(SIMONYI_EMAIL_SUFFIX), {
      message: `Email must end with ${SIMONYI_EMAIL_SUFFIX}`,
    })
    .optional()
    .or(z.literal('')),
  githubUsername: z.string().optional().or(z.literal('')),
  // `profileImage` will be handled separately as it involves File objects.
  // We can add a placeholder for it if needed for type generation.
  profileImage: z.any().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
