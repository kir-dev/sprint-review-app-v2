import { useState } from "react"
import { Difficulty, Log, LogCategory, LogFormData, WorkPeriod } from "../types"

export function useLogForm(workPeriods: WorkPeriod[]) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [formData, setFormData] = useState<LogFormData>({
    date: new Date().toISOString().split('T')[0],
    category: LogCategory.PROJECT,
    description: '',
    difficulty: Difficulty.MEDIUM,
    timeSpent: '',
    projectId: '',
    workPeriodId: '',
  })

  function openDialog(log?: Log) {
    if (log) {
      setEditingLog(log)
      setFormData({
        date: log.date.split('T')[0],
        category: log.category,
        description: log.description,
        difficulty: log.difficulty,
        timeSpent: log.timeSpent?.toString() || '',
        projectId: log.projectId?.toString() || '',
        workPeriodId: log.workPeriodId.toString(),
      })
    } else {
      setEditingLog(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: LogCategory.PROJECT,
        description: '',
        difficulty: Difficulty.MEDIUM,
        timeSpent: '',
        projectId: '',
        workPeriodId: workPeriods[0]?.id.toString() || '',
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
