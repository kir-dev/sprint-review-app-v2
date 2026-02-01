import { useState } from "react"
import { Difficulty, Log, LogCategory, LogFormData, WorkPeriod } from "../types"

export function useLogForm(workPeriods: WorkPeriod[], currentWorkPeriod: WorkPeriod | null) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  
  const initialFormData: LogFormData = {
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0],
    category: LogCategory.PROJECT,
    description: '',
    difficulty: Difficulty.MEDIUM,
    timeSpent: '',
    projectId: '',
    eventId: '',
    workPeriodId: '',
  }

  const [formData, setFormData] = useState<LogFormData>(initialFormData)

  function findWorkPeriodIdForDate(date: string): string {
    if (!date) {
      return currentWorkPeriod?.id.toString() || workPeriods[0]?.id.toString() || ''
    }

    
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)

    const matching = workPeriods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return target >= start && target <= end
    })

    if (matching) {
      return matching.id.toString()
    }

    return currentWorkPeriod?.id.toString() || workPeriods[0]?.id.toString() || ''
  }

  function openDialog(log?: Log) {
    if (log) {
      setEditingLog(log)
      setFormData({
        date: new Date(new Date(log.date).getTime() - new Date(log.date).getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0],
        category: log.category,
        description: log.description,
        difficulty: log.difficulty,
        timeSpent: log.timeSpent?.toString() || '',
        projectId: log.projectId?.toString() || '',
        eventId: log.eventId?.toString() || '',
        workPeriodId: log.workPeriodId.toString(),
      })
    } else {
      setEditingLog(null)
      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      setFormData({
        ...initialFormData,
        date: today,
        workPeriodId: findWorkPeriodIdForDate(today),
      })
    }
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingLog(null)
  }

  return {
    isDialogOpen,
    editingLog,
    formData,
    setFormData,
    openDialog,
    closeDialog,
  }
}
