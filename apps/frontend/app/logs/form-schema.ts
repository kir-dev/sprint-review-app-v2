import { z } from 'zod';
import { LogCategory, Difficulty } from './types';

export const logFormSchema = z.object({
  date: z.coerce
    .date({ required_error: 'A dátum megadása kötelező' })
    .max(new Date(), { message: 'A dátum nem lehet jövőbeli' }),
  category: z.nativeEnum(LogCategory, {
    required_error: 'Kategória kiválasztása kötelező',
  }),
  description: z
    .string()
    .min(10, 'A leírás legalább 10 karakter hosszú legyen')
    .max(500, 'A leírás maximum 500 karakter hosszú lehet'),
  timeSpent: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z
      .number()
      .min(0, 'Az óraszám nem lehet negatív')
      .max(24, 'Az óraszám nem lehet több mint 24')
      .optional(),
  ),
  workPeriodId: z.string().optional(),
  projectId: z.string().optional(),
  eventId: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
});
