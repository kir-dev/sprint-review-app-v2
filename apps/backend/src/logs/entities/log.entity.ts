export class Log {
  id: number;
  date: Date;
  category: string;
  description: string;
  difficulty: string | null;
  timeSpent: number | null;
  userId: number;
  projectId: number | null;
  workPeriodId: number;
}
