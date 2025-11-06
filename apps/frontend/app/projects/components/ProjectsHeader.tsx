import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"

interface ProjectsHeaderProps {
  onCreateProject: () => void
}

export function ProjectsHeader({ onCreateProject }: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-in-top">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FolderKanban className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your projects</p>
        </div>
      </div>
      
      <Button 
        onClick={onCreateProject}
        className="gap-2 transition-all hover:scale-105 shadow-lg"
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  )
}
