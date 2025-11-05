import { useEffect, useState } from "react"
import { Log, Project, WorkPeriod } from "../types"

export function useLogData(token: string | null, userId: number | undefined) {
  const [logs, setLogs] = useState<Log[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workPeriods, setWorkPeriods] = useState<WorkPeriod[]>([])
  const [currentWorkPeriod, setCurrentWorkPeriod] = useState<WorkPeriod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    try {
      setIsLoading(true)
      
      const headers = { Authorization: `Bearer ${token}` }
      
      const [logsRes, projectsRes, workPeriodsRes, currentWorkPeriodRes] = await Promise.all([
        fetch(`/api/logs${userId ? `?userId=${userId}` : ''}`, { headers }),
        fetch('/api/projects', { headers }),
        fetch('/api/work-periods', { headers }),
        fetch('/api/work-periods/current', { headers }),
      ])

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData)
      }
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }
      
      if (workPeriodsRes.ok) {
        const workPeriodsData = await workPeriodsRes.json()
        setWorkPeriods(workPeriodsData)
      }
      
      if (currentWorkPeriodRes.ok) {
        const currentWorkPeriodData = await currentWorkPeriodRes.json()
        setCurrentWorkPeriod(currentWorkPeriodData)
      }
      
      setError(null)
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token, userId])

  return {
    logs,
    setLogs,
    projects,
    workPeriods,
    currentWorkPeriod,
    isLoading,
    error,
    setError,
    loadData,
  }
}
