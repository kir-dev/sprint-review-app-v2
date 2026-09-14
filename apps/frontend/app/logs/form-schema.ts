import { z } from 'zod';
import { Difficulty, LogCategory } from './types';

export const logFormSchema = z.object({
  date: z
    .string()
    .min(1, 'A dátum megadása kötelező')
    .refine(
      (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(`${value}T00:00:00`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day &&
          date <= new Date(new Date().setHours(23, 59, 59, 999))
        );
      },
      {
        message: 'A dátum nem lehet jövőbeli',
      },
    ),
  category: z.nativeEnum(LogCategory, {
    message: 'Kategória kiválasztása kötelező',
  }),
  description: z
    .string()
    .max(500, 'A leírás maximum 500 karakter hosszú lehet'),
  timeSpent: z.string().refine((value) => {
    if (value === '') return true;
    const hours = Number(value.replace(',', '.'));
    return Number.isFinite(hours) && hours > 0 && hours <= 24;
  }, 'Az óraszámnak 0-nál nagyobbnak és legfeljebb 24-nek kell lennie'),
  workPeriodId: z.string(),
  projectId: z.string(),
  eventId: z.string(),
  difficulty: z.nativeEnum(Difficulty).optional(),
});
