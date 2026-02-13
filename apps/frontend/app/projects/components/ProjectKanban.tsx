
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kanban, KanbanBoard, KanbanColumn, KanbanItem, KanbanOverlay } from "@/components/ui/kanban"
import { cn } from "@/lib/utils"
import { AlertCircle, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useFeatureData } from "../hooks/useFeatureData"
import { Feature, FeatureStatus, User } from "../types"
import { FeatureCard } from "./FeatureCard"
import { FeatureDialog } from "./FeatureDialog"

interface ProjectKanbanProps {
  projectId: string
  token: string | null
  users: User[]
}

const COLUMNS: { id: FeatureStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'Teendő', color: 'bg-slate-500/10 border-slate-500/20' },
  { id: 'IN_PROGRESS', title: 'Folyamatban', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'BLOCKED', title: 'Blokkolva', color: 'bg-red-500/10 border-red-500/20' },
  { id: 'DONE', title: 'Kész', color: 'bg-green-500/10 border-green-500/20' },
]

export function ProjectKanban({ projectId, token, users }: ProjectKanbanProps) {
  const { 
    features, 
    isLoading, 
    createFeature, 
    updateFeature, 
    deleteFeature 
  } = useFeatureData(projectId, token)

  const [featuresByStatus, setFeaturesByStatus] = useState<Record<FeatureStatus, Feature[]>>({
    TODO: [],
    IN_PROGRESS: [],
    BLOCKED: [],
    DONE: []
  })

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)

  useEffect(() => {
    const newFeaturesByStatus: Record<FeatureStatus, Feature[]> = {
      TODO: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      DONE: []
    }

    features.forEach(feature => {
      if (newFeaturesByStatus[feature.status]) {
        newFeaturesByStatus[feature.status].push(feature)
      }
    })

    setFeaturesByStatus(newFeaturesByStatus)
  }, [features])

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the feature - handle both string and number comparison
    const feature = features.find(f => f.id == activeId)
    if (!feature) return

    let newStatus: FeatureStatus | null = null

    // Determine new status
    if (Object.keys(featuresByStatus).includes(overId as string)) {
      // Dropped on a column
      newStatus = overId as FeatureStatus
    } else {
        // Dropped on an item
        // Handle both string and number comparison for overId
        const overFeature = features.find(f => f.id == overId)
        if(overFeature) {
            newStatus = overFeature.status
        }
    }

    if (newStatus && newStatus !== feature.status) {
        // Optimistic update handled by hook, just call API
       await updateFeature(feature.id, { status: newStatus })
    }
  }

  const openNewFeatureDialog = () => {
    setEditingFeature(null)
    setIsDialogOpen(true)
  }

  const openEditFeatureDialog = (feature: Feature) => {
    setEditingFeature(feature)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = async (featureId: number) => {
      if(confirm("Biztosan törölni szeretnéd ezt a feladatot?")) {
        await deleteFeature(featureId)
      }
  }

  if (isLoading && features.length === 0) {
      return <div>Betöltés...</div>
  }

  return (
    <div className="h-[calc(100vh-250px)] w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Feladatok</h2>
        <Button onClick={openNewFeatureDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Új feladat
        </Button>
      </div>

      <Kanban
        value={featuresByStatus}
        onDragEnd={handleDragEnd}
        getItemValue={(item) => item.id}
        orientation="horizontal"
      >
        <KanbanBoard className="h-full overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              value={column.id}
              className={cn("min-w-[300px] h-full", column.color)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    {column.id === 'BLOCKED' && <AlertCircle className="w-4 h-4"/>}
                    {column.title}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {featuresByStatus[column.id]?.length || 0}
                </Badge>
              </div>
              
              <div className="flex flex-col gap-2 overflow-y-auto h-full pr-1">
                {featuresByStatus[column.id]?.map((feature) => (
                  <KanbanItem key={feature.id} value={feature.id} asHandle className="rounded-md">
                      <FeatureCard 
                          feature={feature} 
                          onClick={() => openEditFeatureDialog(feature)}
                          onDelete={() => handleDeleteClick(feature.id)}
                      />
                  </KanbanItem>
                ))}
            </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <KanbanOverlay>
            {({ value }) => {
                const feature = features.find(f => f.id === value)
                if (!feature) return null
                return (
                    <FeatureCard feature={feature} />
                )
            }}
        </KanbanOverlay>
      </Kanban>

      <FeatureDialog 
        isOpen={isDialogOpen}
        editingFeature={editingFeature}
        users={users}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async (data) => {
            if (editingFeature) {
                return await updateFeature(editingFeature.id, data)
            } else {
                return await createFeature(data)
            }
        }}
      />
    </div>
  )
}
