import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"

interface ProjectsHeaderProps {
  onCreateProject: () => void
}

export function ProjectsHeader({ onCreateProject }: ProjectsHeaderProps) {
  return (
    <PageHeader
      title="Projektek"
      description="Projektek kezelése"
      icon={FolderKanban}
    >
      <Button 
        onClick={onCreateProject}
        className="gap-2 transition-all hover:scale-105 shadow-lg"
      >
        <Plus className="h-4 w-4" />
        Új Projekt
      </Button>
    </PageHeader>
  )
}
