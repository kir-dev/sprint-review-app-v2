import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Search, User as UserIcon, X } from "lucide-react"
import React, { useMemo, useState } from "react"
import { Project, ProjectFormData, User } from "../types"

interface ProjectDialogProps {
  isOpen: boolean
  editingProject: Project | null
  formData: ProjectFormData
  users: User[]
  onFormDataChange: (data: ProjectFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function ProjectDialog({
  isOpen,
  editingProject,
  formData,
  users,
  onFormDataChange,
  onSubmit,
  onClose,
}: ProjectDialogProps) {
  const [managerSearch, setManagerSearch] = useState("")
  const [memberSearch, setMemberSearch] = useState("")

  // Filter users for project manager dropdown
  const filteredManagerUsers = useMemo(() => {
    if (!managerSearch) return users
    const search = managerSearch.toLowerCase()
    return users.filter(user => 
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }, [users, managerSearch])

  // Filter and separate users for team members
  const { selectedMembers, availableMembers } = useMemo(() => {
    const search = memberSearch.toLowerCase()
    const selected: User[] = []
    const available: User[] = []
    
    users.forEach(user => {
      const isSelected = formData.memberIds.includes(user.id.toString())
      const matchesSearch = !search || 
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      
      if (matchesSearch) {
        if (isSelected) {
          selected.push(user)
        } else {
          available.push(user)
        }
      }
    })
    
    return { selectedMembers: selected, availableMembers: available }
  }, [users, formData.memberIds, memberSearch])

  const selectedManager = users.find(u => u.id.toString() === formData.projectManagerId)

  const handleMemberToggle = (userId: string) => {
    const currentMembers = formData.memberIds
    const isSelected = currentMembers.includes(userId)
    
    onFormDataChange({
      ...formData,
      memberIds: isSelected
        ? currentMembers.filter(id => id !== userId)
        : [...currentMembers, userId]
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8 animate-slide-in-bottom">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {editingProject ? 'Projekt Szerkesztése' : 'Új Projekt Létrehozása'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Projekt Neve <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                placeholder="Add meg a projekt nevét"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">Leírás</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                placeholder="Add meg a projekt leírását"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="githubUrl" className="block text-sm font-medium">GitHub URL</label>
              <input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFormDataChange({ ...formData, githubUrl: e.target.value })
                }
                placeholder="https://github.com/..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Projektmenedzser
              </label>
              
              {/* Selected Manager Display */}
              {selectedManager && (
                <div className="mb-2 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedManager.fullName}</p>
                      <p className="text-xs text-muted-foreground">{selectedManager.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onFormDataChange({ ...formData, projectManagerId: "" })}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Manager Search */}
              {!selectedManager && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Keress projektmenedzsert..."
                      value={managerSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManagerSearch(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  
                  {/* Manager Selection List */}
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {filteredManagerUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nem található felhasználó
                      </p>
                    ) : (
                      filteredManagerUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            onFormDataChange({ ...formData, projectManagerId: user.id.toString() })
                            setManagerSearch("")
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors border-b last:border-b-0"
                        >
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Csapattagok</label>
              
              {/* Member Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Keress csapattagokat..."
                  value={memberSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberSearch(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-1">
                    Kiválasztva ({selectedMembers.length})
                  </p>
                  <div className="space-y-1">
                    {selectedMembers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleMemberToggle(user.id.toString())}
                        className="w-full flex items-center gap-3 p-2 bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/15 transition-all group"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <X className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Members */}
              {availableMembers.length > 0 && (
                <div className="space-y-1">
                  {selectedMembers.length > 0 && (
                    <p className="text-xs font-medium text-muted-foreground px-1 pt-2">
                      Elérhető
                    </p>
                  )}
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {availableMembers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleMemberToggle(user.id.toString())}
                        className="w-full flex items-center gap-3 p-2 hover:bg-accent transition-colors border-b last:border-b-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  Nincs elérhető felhasználó
                </p>
              )}

              {users.length > 0 && selectedMembers.length === 0 && availableMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  Nincs a keresésnek megfelelő felhasználó
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="transition-all hover:scale-105 order-2 sm:order-1"
              >
                Mégse
              </Button>
              <Button
                type="submit"
                className="transition-all hover:scale-105 order-1 sm:order-2"
              >
                {editingProject ? 'Projekt Frissítése' : 'Projekt Létrehozása'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
