import { z } from 'zod';

export const accessSchema = z.object({
  groupId: z
    .number()
    .int()
    .positive('Pozitív PÉK-körazonosítót adj meg.')
    .max(Number.MAX_SAFE_INTEGER),
  groupName: z.string().trim().min(1, 'Add meg a kör nevét.').max(100),
  allowAlumni: z.boolean(),
  version: z.string().uuid(),
  revision: z.string().uuid(),
});

export const accessUpdateSchema = accessSchema.omit({ groupId: true });
export type AccessUpdate = z.infer<typeof accessUpdateSchema>;

export type AccessPolicy = z.infer<typeof accessSchema>;
