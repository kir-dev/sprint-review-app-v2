
"use client"

import { ErrorAlert } from "@/components/ErrorAlert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingLogo } from "@/components/ui/LoadingLogo"
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

  const fetchStats = async () => {
    if (!token || !projectId) return

    try {
      const statsResponse = await fetch(`/api/projects/${projectId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!token || !projectId) return;

      setIsLoading(true);
      try {
        // Fetch project, stats, and users in parallel
        const [projectRes, statsRes, usersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/projects/${projectId}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
        } else {
          // Fallback logic if needed (matching original approach though unified is better)
          const listResponse = await fetch("/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (listResponse.ok) {
            const projects = await listResponse.json();
            const found = projects.find((p: Project) => p.id === parseInt(projectId));
            if (found) setProject(found);
            else throw new Error("Projekt nem található");
          } else {
            throw new Error("Projekt nem található");
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err: unknown) {
        console.error("Error loading project data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Hiba történt az adatok betöltésekor";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadData()
  }, [projectId, token])

  if (isAuthLoading) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={60} />
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
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    {project.description ? (
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {project.description}
                        </p>
                    ) : null}
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                <Users className="h-3 w-3" />
                             </div>
                             <span>
                                Menedzser: <span className="font-medium text-foreground">{project.projectManager?.fullName || 'Nincs'}</span>
                             </span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                <Calendar className="h-3 w-3" />
                             </div>
                             <span>
                                Létrehozva: <span className="font-medium text-foreground">{new Date(project.createdAt).toLocaleDateString('hu-HU')}</span>
                             </span>
                        </div>
                         <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                <Users className="h-3 w-3" />
                             </div>
                             <span>
                                Tagok: <span className="font-medium text-foreground">{project.members?.length || 0} fő</span>
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            {project.githubUrl ? (
                <Button 
                    variant="secondary" 
                    size="sm" 
                    asChild 
                    className="rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm shrink-0 px-6 h-10 transition-all hover:scale-105 active:scale-95 group"
                >
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Github className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        <span className="font-semibold tracking-wide whitespace-nowrap">GitHub Repository</span>
                    </a>
                </Button>
            ) : null}
        </div>
      </div>

      {/* Stats */}
      {stats ? (
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
      ) : null}

      {/* Kanban Board */}
      <div className="mt-4">
        <ProjectKanban
          projectId={projectId}
          token={token}
          users={users}
          onFeatureChange={fetchStats}
        />
      </div>

    </div>
  )
}
