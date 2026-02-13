
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kanban, KanbanBoard, KanbanColumn, KanbanItem } from "@/components/ui/kanban"
import { cn } from "@/lib/utils"
import { AlertCircle, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useFeatureData } from "../hooks/useFeatureData"
import { Feature, FeatureStatus, User } from "../types"
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

    const activeId = active.id as number
    const overId = over.id as number | string // specific item (number) or column (string)

    // Find the feature
    const feature = features.find(f => f.id === activeId)
    if (!feature) return

    let newStatus: FeatureStatus | null = null

    // Determine new status
    if (Object.keys(featuresByStatus).includes(overId as string)) {
      // Dropped on a column
      newStatus = overId as FeatureStatus
    } else {
        // Dropped on an item
        const overFeature = features.find(f => f.id === (overId as number))
        if(overFeature) {
            newStatus = overFeature.status
        }
    }

    if (newStatus && newStatus !== feature.status) {
        // Optimistic update handled by hook, just call API
       await updateFeature(activeId, { status: newStatus })
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
                    <KanbanItem key={feature.id} value={feature.id} className="bg-card p-3 rounded-md shadow-sm border border-border hover:border-primary/50 transition-colors group relative">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div 
                                className="cursor-pointer p-1 hover:bg-muted rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditFeatureDialog(feature);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </div>
                            <div 
                                className="cursor-pointer p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(feature.id);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </div>
                        </div>

                        <div className="font-medium text-sm mb-1 pr-14">{feature.title}</div>
                        {feature.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {feature.description}
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                {feature.assignee ? (
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={feature.assignee.profileImage} />
                                        <AvatarFallback>{feature.assignee.fullName.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                        <UserIcon className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                )}
                                {feature.priority && (
                                     <Badge variant={
                                         feature.priority === 'CRITICAL' ? 'destructive' : 
                                         feature.priority === 'HIGH' ? 'destructive' :  // Use destructive for high too or custom
                                         feature.priority === 'MEDIUM' ? 'default' : 'secondary'
                                     } className="text-[10px] px-1 py-0 h-5">
                                         {feature.priority === 'CRITICAL' ? 'KRITIKUS' :
                                          feature.priority === 'HIGH' ? 'MAGAS' :
                                          feature.priority === 'MEDIUM' ? 'KÖZEPES' : 'ALACSONY'}
                                     </Badge>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {new Date(feature.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </KanbanItem>
                ))}
            </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>
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

function UserIcon(props: React.ComponentProps<'svg'>) {
    return (
      <svg
        {...props}

        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
