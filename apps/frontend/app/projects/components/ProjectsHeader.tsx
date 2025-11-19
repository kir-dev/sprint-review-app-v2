import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface ProjectsHeaderProps {
  onCreateProject: () => void
}

export function ProjectsHeader({ onCreateProject }: ProjectsHeaderProps) {
  return (
    <PageHeader
      title="Projects"
      description="Manage your projects"
      icon={FolderKanban}
    >
      <Button 
        onClick={onCreateProject}
        className="gap-2 transition-all hover:scale-105 shadow-lg"
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </PageHeader>
  )
}
