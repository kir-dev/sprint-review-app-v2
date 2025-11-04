import { Log, LogFilters } from "../types"

export function filterLogs(logs: Log[], filters: LogFilters): Log[] {
  return logs.filter(log => {
    if (filters.category && log.category !== filters.category) return false
    if (filters.projectId && log.projectId?.toString() !== filters.projectId) return false
    if (filters.workPeriodId && log.workPeriodId.toString() !== filters.workPeriodId) return false
    return true
  })
}

export function calculateStats(logs: Log[]) {
  const totalHours = logs.reduce((sum, log) => sum + (log.timeSpent || 0), 0)
  
  // Csak azokat a logokat számoljuk, amelyeknek van timeSpent értéke
  const logsWithTimeSpent = logs.filter(log => log.timeSpent !== null && log.timeSpent !== undefined && log.timeSpent > 0)
  const avgHours = logsWithTimeSpent.length > 0 
    ? parseFloat((totalHours / logsWithTimeSpent.length).toFixed(1)) 
    : 0
  
  return {
    totalLogs: logs.length,
    totalHours,
    avgHours,
  }
}
