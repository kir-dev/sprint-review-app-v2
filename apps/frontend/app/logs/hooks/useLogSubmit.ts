import { toast } from "sonner";
import { Log, LogFormData, WorkPeriod } from "../types";
import { findWorkPeriodForDate } from "../utils/log-helpers";

interface UseLogSubmitProps {
  token: string | null;
  user: { id: number } | null;
  workPeriods: WorkPeriod[];
  onSuccess?: () => void;
}

export function useLogSubmit({ token, user, workPeriods, onSuccess }: UseLogSubmitProps) {
  
  async function handleSubmit(data: LogFormData, editingLog?: Log | null) {
      if (!user?.id || !token) return;
  
      const resolvedWorkPeriodId = data.workPeriodId
        ? parseInt(data.workPeriodId)
        : (findWorkPeriodForDate(data.date, workPeriods)?.id ?? undefined);
  
      if (!resolvedWorkPeriodId) {
        toast.error("Hiba", {
          description: "Ehhez a dátumhoz nem található work period",
        });
        return;
      }
  
      const payload = {
        date: data.date,
        category: data.category,
        description: data.description,
        difficulty: data.difficulty || undefined,
        timeSpent: data.timeSpent ? data.timeSpent : undefined,
        userId: user.id,
        projectId: data.projectId ? parseInt(data.projectId) : null,
        eventId: data.eventId ? parseInt(data.eventId) : null,
        workPeriodId: resolvedWorkPeriodId,
      };
  
      try {
        const url = editingLog ? `/api/logs/${editingLog.id}` : '/api/logs';
        const method = editingLog ? 'PATCH' : 'POST';
  
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
          toast.success("Siker", {
              description: editingLog ? "Bejegyzés sikeresen frissítve" : "Bejegyzés sikeresen létrehozva",
          });
          if (onSuccess) {
            onSuccess();
          }
        } else {
          const error = await response.json();
          toast.error("Hiba", {
              description: error.message || 'Nem sikerült menteni a bejegyzést',
          });
        }
      } catch (err) {
        console.error('Error saving log:', err);
        toast.error("Hiba", {
          description: 'Nem sikerült menteni a bejegyzést. Próbáld újra.',
        });
      }
    }

    return { handleSubmit };
}
