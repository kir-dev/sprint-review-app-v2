import { useEffect, useState } from "react"
import { Project, User } from "../types"

export function useProjectData(token: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    try {
      setIsLoading(true)
      
      const headers = { Authorization: `Bearer ${token}` }
      
      const [projectsRes, usersRes] = await Promise.all([
        fetch('/api/projects', { headers }),
        fetch('/api/users', { headers }),
      ])

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
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
  }, [token])

  return {
    projects,
    setProjects,
    users,
    isLoading,
    error,
    setError,
    loadData,
  }
}
