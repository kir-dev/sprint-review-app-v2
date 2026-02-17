"use client"

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { ErrorAlert } from "@/components/ErrorAlert"
import { MobileFloatingActionButton } from "@/components/MobileFloatingActionButton"
import { LoadingLogo } from "@/components/ui/LoadingLogo"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProjectDialog } from "./components/ProjectDialog"
import { ProjectsHeader } from "./components/ProjectsHeader"
import { ProjectsList } from "./components/ProjectsList"
import { useProjectData } from "./hooks/useProjectData"
import { useProjectForm } from "./hooks/useProjectForm"

export default function ProjectsPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  // Custom hooks
  const { projects, setProjects, users, isLoading, error, setError, loadData } = useProjectData(token)
  const { isDialogOpen, editingProject, formData, setFormData, openDialog, closeDialog } = useProjectForm()

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login')
    }
  }, [token, isAuthLoading, router])

  // Handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      githubUrl: formData.githubUrl || undefined,
      projectManagerId: formData.projectManagerId ? parseInt(formData.projectManagerId) : undefined,
      memberIds: formData.memberIds.map(id => parseInt(id)),
    }

    setIsSubmitting(true)

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await loadData()
        closeDialog()
      } else {
        const error = await response.json()
        setError(error.message || 'Nem sikerült menteni a projektet')
      }
    } catch (err) {
      console.error('Error saving project:', err)
      setError('Nem sikerült menteni a projektet. Próbáld újra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDeleteClick(id: number) {
    setProjectToDelete(id)
    setDeleteConfirmOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!projectToDelete) return

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setProjects(projects.filter(project => project.id !== projectToDelete))
        setDeleteConfirmOpen(false)
        setProjectToDelete(null)
      } else {
        setError('Nem sikerült törölni a projektet')
      }
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Nem sikerült törölni a projektet. Próbáld újra.')
    }
  }

  function handleDeleteCancel() {
    setDeleteConfirmOpen(false)
    setProjectToDelete(null)
  }



  // Loading state
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={60} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
      <ProjectsHeader 
        onCreateProject={() => openDialog()}
      />

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <ProjectsList
        projects={projects}
        isLoading={isLoading}
        onCreateProject={() => openDialog()}
        onEditProject={openDialog}
        onDeleteProject={handleDeleteClick}
      />

      <ProjectDialog
        isOpen={isDialogOpen}
        editingProject={editingProject}
        formData={formData}
        isPending={isSubmitting}
        users={users}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Projekt Törlése"
        description="Biztosan törölni szeretnéd ezt a projektet? Ez a művelet nem visszavonható."
      />

      {!isDialogOpen && !deleteConfirmOpen && (
        <MobileFloatingActionButton onClick={() => openDialog()} />
      )}
    </div>
  )
}
