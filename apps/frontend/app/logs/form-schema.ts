import { z } from 'zod';
import { Difficulty, LogCategory } from './types';

export const logFormSchema = z.object({
  date: z.coerce
    .date({ message: 'A dátum megadása kötelező' })
    .max(new Date(), { message: 'A dátum nem lehet jövőbeli' }),
  category: z.nativeEnum(LogCategory, {
    message: 'Kategória kiválasztása kötelező',
  }),
  description: z
    .string()
    .max(500, 'A leírás maximum 500 karakter hosszú lehet'),
  timeSpent: z.preprocess(
    (val) =>
      val === '' ? undefined : Number(String(val).replace(',', '.')),
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
