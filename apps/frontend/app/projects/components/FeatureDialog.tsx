
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { Feature, FeaturePriority, FeatureStatus, User } from "../types"

interface FeatureDialogProps {
  isOpen: boolean
  editingFeature: Feature | null
  users: User[]
  onClose: () => void
  onSubmit: (data: Partial<Feature>) => Promise<boolean>
}

export function FeatureDialog({
  isOpen,
  editingFeature,
  users,
  onClose,
  onSubmit,
}: FeatureDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO" as FeatureStatus,
    priority: "MEDIUM" as FeaturePriority,
    assigneeId: "unassigned",
  })

  useEffect(() => {
    if (editingFeature) {
      setFormData({
        title: editingFeature.title,
        description: editingFeature.description || "",
        status: editingFeature.status,
        priority: editingFeature.priority || "MEDIUM",
        assigneeId: editingFeature.assigneeId?.toString() || "unassigned",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "unassigned",
      })
    }
  }, [editingFeature, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data: Partial<Feature> = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId === "unassigned" ? undefined : parseInt(formData.assigneeId),
    }

    const success = await onSubmit(data)
    setIsSubmitting(false)
    if (success) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingFeature ? "Feladat szerkesztése" : "Új feladat hozzáadása"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Cím</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Feladat címe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Részletes leírás..."
              className="resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Státusz</Label>
              <Select
                value={formData.status}
                onValueChange={(value: FeatureStatus) => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz státuszt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Teendő</SelectItem>
                  <SelectItem value="IN_PROGRESS">Folyamatban</SelectItem>
                  <SelectItem value="DONE">Kész</SelectItem>
                  <SelectItem value="BLOCKED">Blokkolva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritás</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: FeaturePriority) => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Válassz prioritást" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Alacsony</SelectItem>
                  <SelectItem value="MEDIUM">Közepes</SelectItem>
                  <SelectItem value="HIGH">Magas</SelectItem>
                  <SelectItem value="CRITICAL">Kritikus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Felelős</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => 
                setFormData({ ...formData, assigneeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Válassz felelőst" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Nincs hozzárendelve</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Mégse
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mentés..." : "Mentés"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
