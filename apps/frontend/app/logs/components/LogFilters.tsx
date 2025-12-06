import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { categoryLabels } from "../constants"
import { LogFilters as LogFiltersType, Project, WorkPeriod } from "../types"

interface LogFiltersProps {
  filters: LogFiltersType
  projects: Project[]
  workPeriods: WorkPeriod[]
  onFiltersChange: (filters: LogFiltersType) => void
  onClearFilters: () => void
  isVisible: boolean
}

export function LogFilters({ 
  filters, 
  projects, 
  workPeriods, 
  onFiltersChange,
  onClearFilters,
  isVisible,
}: LogFiltersProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setIsAnimatingOut(true)
    } else {
      setIsAnimatingOut(false)
    }
  }, [isVisible])

  return (
    <Card className={isAnimatingOut ? "animate-slide-out-top" : "animate-slide-in-top"}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Szűrők
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Összes Törlése
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategória</label>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Összes kategória</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Projekt</label>
            <select
              value={filters.projectId}
              onChange={(e) => onFiltersChange({ ...filters, projectId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Összes projekt</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Időszak</label>
            <select
              value={filters.workPeriodId}
              onChange={(e) => onFiltersChange({ ...filters, workPeriodId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Összes időszak</option>
              {workPeriods.map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
