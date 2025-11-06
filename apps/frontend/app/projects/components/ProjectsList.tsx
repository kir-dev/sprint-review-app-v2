import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Github, Trash2, User, Users } from "lucide-react"
import { Project } from "../types"

interface ProjectsListProps {
  projects: Project[]
  isLoading: boolean
  onCreateProject: () => void
  onEditProject: (project: Project) => void
  onDeleteProject: (id: number) => void
}

export function ProjectsList({
  projects,
  isLoading,
  onCreateProject,
  onEditProject,
  onDeleteProject,
}: ProjectsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-primary/20 mb-4" />
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="animate-slide-in-bottom">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first project to get started
          </p>
          <Button onClick={onCreateProject} className="transition-all hover:scale-105">
            Create Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project, index) => (
        <Card
          key={project.id}
          className="animate-slide-in-bottom hover:shadow-lg transition-all duration-300 group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditProject(project)}
                  className="h-8 w-8 p-0 hover:bg-primary/10 transition-all hover:scale-110"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteProject(project.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
            
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline transition-all hover:translate-x-1"
              >
                <Github className="h-4 w-4" />
                <span className="truncate">GitHub</span>
              </a>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
              {project.projectManager && (
                <div className="flex items-center gap-1" title="Project Manager">
                  <User className="h-4 w-4" />
                  <span className="truncate">{project.projectManager.fullName}</span>
                </div>
              )}
              
              {project._count && (
                <div className="flex items-center gap-1" title="Team Members">
                  <Users className="h-4 w-4" />
                  <span>{project._count.members}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
