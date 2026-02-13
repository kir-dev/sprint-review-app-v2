
"use client"

import { ErrorAlert } from "@/components/ErrorAlert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { ArrowLeft, Calendar, Clock, Github, ListTodo, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProjectKanban } from "../components/ProjectKanban"
import { Project, ProjectStats, User } from "../types"

export default function ProjectDetailsPage() {
  const { token, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login')
    }
  }, [token, isAuthLoading, router])

  useEffect(() => {
    async function loadData() {
      if (!token || !projectId) return

      setIsLoading(true)
      try {
        // Fetch project details
        // We reuse the list endpoint but filter client-side or fetch all? 
        // Ideally we should have a GET /api/projects/:id endpoint. 
        // Since I didn't create that specifically in the plan (oops, I did creating features but maybe not details?), 
        // let's assume we can fetch list locally or if API supports it.
        // The plan mentioned "Project Details component".
        // Let's check existing API. If not, I'll fetch list and find, or assume /api/projects/:id works.
        // Existing ProjectForm uses PATCH /api/projects/:id, so GET likely works too if standard controller.
        
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (!projectResponse.ok) {
             // Fallback: try to find in list if single fetch fails
             const listResponse = await fetch('/api/projects', {
                 headers: { Authorization: `Bearer ${token}` }
             })
             if(listResponse.ok) {
                 const projects = await listResponse.json()
                 const found = projects.find((p: Project) => p.id === parseInt(projectId))
                 if(found) setProject(found)
                 else throw new Error('Projekt nem található')
             } else {
                 throw new Error('Projekt nem található')
             }
        } else {
            const projectData = await projectResponse.json()
            setProject(projectData)
        }

        // Fetch Stats
        const statsResponse = await fetch(`/api/projects/${projectId}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if(statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
        }

        // Fetch Users (for assigning)
        const usersResponse = await fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        })
        if(usersResponse.ok) {
            const usersData = await usersResponse.json()
            setUsers(usersData)
        }

      } catch (err: unknown) {
        console.error('Error loading project data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Hiba történt az adatok betöltésekor'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [projectId, token])

  if (isAuthLoading) return null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <ErrorAlert error={error || 'A projekt nem található'} onClose={() => router.back()} />
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Vissza
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
            className="h-8 w-8"
            >
            <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    {project.name}
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="h-6 w-6" />
                        </a>
                    )}
                </h1>
                {project.description && (
                    <p className="text-muted-foreground mt-1 max-w-2xl">
                        {project.description}
                    </p>
                )}
            </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center bg-card p-3 rounded-lg border shadow-sm">
             <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Menedzser: <span className="font-medium text-foreground">{project.projectManager?.fullName || 'Nincs'}</span></span>
             </div>
             <Separator orientation="vertical" className="h-4 hidden sm:block" />
             <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Létrehozva: <span className="font-medium text-foreground">{new Date(project.createdAt).toLocaleDateString()}</span></span>
             </div>
             <Separator orientation="vertical" className="h-4 hidden sm:block" />
             <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Tagok: <span className="font-medium text-foreground">{project.members?.length || 0} fő</span></span>
             </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Összes Bejegyzés</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.totalLogs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eltöltött Idő</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.totalTimeSpent}h</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nyitott Feladatok</CardTitle>
                <div className="h-4 w-4 rounded-full bg-slate-500/20 border border-slate-500/50" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">
                    {(stats.featureCounts.TODO || 0) + (stats.featureCounts.IN_PROGRESS || 0) + (stats.featureCounts.BLOCKED || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                    {stats.featureCounts.TODO || 0} teendő, {stats.featureCounts.IN_PROGRESS || 0} folyamatban
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Elvégzett Feladatok</CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500/20 border border-green-500/50" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.featureCounts.DONE || 0}</div>
                </CardContent>
            </Card>
        </div>
      )}

      {/* Kanban Board */}
      <div className="mt-4">
         <ProjectKanban projectId={projectId} token={token} users={users} />
      </div>

    </div>
  )
}
