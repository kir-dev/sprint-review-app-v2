import { useState } from "react"
import { Project, ProjectFormData } from "../types"

export function useProjectForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    githubUrl: '',
    projectManagerId: '',
    memberIds: [],
  })

  function openDialog(project?: Project) {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description || '',
        githubUrl: project.githubUrl || '',
        projectManagerId: project.projectManagerId?.toString() || '',
        memberIds: project.members?.map(m => m.id.toString()) || [],
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        githubUrl: '',
        projectManagerId: '',
        memberIds: [],
      })
    }
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingProject(null)
  }

  return {
    isDialogOpen,
    editingProject,
    formData,
    setFormData,
    openDialog,
    closeDialog,
  }
}
