import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar22 } from "@/components/ui/datepicker"
import { useState } from "react"
import { categoryLabels, difficultyLabels } from "../constants"
import { Log, LogCategory, LogFormData, Project, WorkPeriod } from "../types"

interface LogDialogProps {
  isOpen: boolean
  editingLog: Log | null
  formData: LogFormData
  projects: Project[]
  workPeriods: WorkPeriod[]
  onFormDataChange: (formData: LogFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

interface ValidationErrors {
  date?: string
  category?: string
  description?: string
  workPeriodId?: string
  timeSpent?: string
}

export function LogDialog({
  isOpen,
  editingLog,
  formData,
  projects,
  workPeriods,
  onFormDataChange,
  onSubmit,
  onClose,
}: LogDialogProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  if (!isOpen) return null

  function validateField(field: string, value: any): string | undefined {
    switch (field) {
      case 'date':
        if (!value) return 'A dátum megadása kötelező'
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (selectedDate > today) return 'A dátum nem lehet jövőbeli'
        return undefined

      case 'category':
        if (!value) return 'Kategória kiválasztása kötelező'
        return undefined

      case 'description':
        if (!value || value.trim() === '') return 'A leírás megadása kötelező'
        if (value.trim().length < 10) return 'A leírás legalább 10 karakter hosszú legyen'
        if (value.trim().length > 500) return 'A leírás maximum 500 karakter hosszú lehet'
        return undefined

      case 'timeSpent':
        if (value !== '' && value !== undefined) {
          const num = parseFloat(value)
          if (isNaN(num)) return 'Az óraszám csak szám lehet'
          if (num < 0) return 'Az óraszám nem lehet negatív'
          if (num > 24) return 'Az óraszám nem lehet több mint 24'
        }
        return undefined

      default:
        return undefined
    }
  }

  function handleBlur(field: string) {
    setTouched({ ...touched, [field]: true })
    const value = (formData as any)[field]
    const error = validateField(field, value)
    setErrors({ ...errors, [field]: error })
  }

  function findWorkPeriodForDate(dateString: string) {
    if (!dateString) return null
    const target = new Date(dateString)
    target.setHours(0, 0, 0, 0)

    return workPeriods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return target >= start && target <= end
    }) || null
  }

  function handleChange(field: string, value: any) {
    if (field === 'date') {
      const matchingPeriod = findWorkPeriodForDate(value)
      const updatedForm = {
        ...formData,
        date: value,
        workPeriodId: matchingPeriod ? matchingPeriod.id.toString() : '',
      }
      onFormDataChange(updatedForm)

      if (touched.workPeriodId && !matchingPeriod) {
        setErrors((prev) => ({ ...prev, workPeriodId: 'Ehhez a dátumhoz nem található work period' }))
      } else {
        setErrors((prev) => {
          if (!prev.workPeriodId) return prev
          const { workPeriodId, ...rest } = prev
          return rest
        })
      }

      if (touched[field]) {
        const error = validateField(field, value)
        setErrors({ ...errors, [field]: error })
      }
      return
    }

    onFormDataChange({ ...formData, [field]: value })

    if (touched[field]) {
      const error = validateField(field, value)
      setErrors({ ...errors, [field]: error })
    }
  }

  function handleSubmitWithValidation(e: React.FormEvent) {
    e.preventDefault()

    // Validáljuk az összes kötelező mezőt
    const newErrors: ValidationErrors = {}
    const requiredFields: (keyof ValidationErrors)[] = ['date', 'category', 'description']
    
    requiredFields.forEach(field => {
      const error = validateField(field, (formData as any)[field])
      if (error) newErrors[field] = error
    })

    if (!formData.workPeriodId) {
      const matchingPeriod = findWorkPeriodForDate(formData.date)
      if (matchingPeriod) {
        onFormDataChange({ ...formData, workPeriodId: matchingPeriod.id.toString() })
      } else {
        newErrors.workPeriodId = 'Ehhez a dátumhoz nem található work period'
      }
    }

    // Opcionális mező validálása
    if (formData.timeSpent !== '' && formData.timeSpent !== undefined) {
      const error = validateField('timeSpent', formData.timeSpent)
      if (error) newErrors.timeSpent = error
    }

    // Ha van hiba, megjelenítjük és nem küldjük el
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Csak a hibás mezőket touch-oljuk
      const newTouched: Record<string, boolean> = {}
      requiredFields.forEach(field => {
        newTouched[field] = true
      })
      if (formData.timeSpent !== '' && formData.timeSpent !== undefined) {
        newTouched.timeSpent = true
      }
      if (newErrors.workPeriodId) {
        newTouched.workPeriodId = true
      }
      setTouched(newTouched)
      return
    }

    // Ha nincs hiba, töröljük az error state-et és továbbadjuk a submit-ot
    setErrors({})
    onSubmit(e)
  }

  function handleClose() {
    setErrors({})
    setTouched({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-in-bottom">
        <CardHeader>
          <CardTitle>{editingLog ? 'Napló Szerkesztése' : 'Új Napló Létrehozása'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithValidation} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Calendar22
                    id="date"
                    value={formData.date}
                    className="w-full"
                    popoverClassName="w-80"
                    required
                    onChange={(val) => handleChange('date', val)}
                    onBlur={() => handleBlur('date')}
                  />
                  {errors.date && touched.date && (
                    <p className="text-sm text-destructive animate-fade-in">{errors.date}</p>
                  )}
                </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Kategória <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as LogCategory)}
                  onBlur={() => handleBlur('category')}
                  className={`flex h-10 w-full rounded-md border ${
                    errors.category && touched.category ? 'border-destructive' : 'border-input'
                  } bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.category && touched.category && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty" className="text-sm font-medium">Nehézség</label>
                <select
                  id="difficulty"
                  value={formData.difficulty || ''}
                  onChange={(e) => handleChange('difficulty', e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Válassz nehézséget</option>
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="timeSpent" className="text-sm font-medium">Eltöltött idő (óra)</label>
                <input
                  id="timeSpent"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.timeSpent}
                  onChange={(e) => handleChange('timeSpent', e.target.value)}
                  onBlur={() => handleBlur('timeSpent')}
                  className={`flex h-10 w-full rounded-md border ${
                    errors.timeSpent && touched.timeSpent ? 'border-destructive' : 'border-input'
                  } bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                  placeholder="pl. 2.5"
                />
                {errors.timeSpent && touched.timeSpent && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.timeSpent}</p>
                )}
                {errors.workPeriodId && touched.workPeriodId && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.workPeriodId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="projectId" className="text-sm font-medium">Projekt</label>
                <select
                  id="projectId"
                  value={formData.projectId}
                  onChange={(e) => handleChange('projectId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Nincs projekt</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Leírás <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                className={`flex w-full rounded-md border ${
                  errors.description && touched.description ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                placeholder="Írd le, mit csináltál... (minimum 10 karakter)"
              />
              {errors.description && touched.description && (
                <p className="text-sm text-destructive animate-fade-in">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 karakter
              </p>
            </div>

            {/* Csak akkor mutassuk az alert-et, ha van érintett mező ÉS van hiba azon a mezőn */}
            {Object.keys(errors).some(key => touched[key] && errors[key as keyof ValidationErrors]) && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md animate-fade-in">
                <p className="text-sm text-destructive font-medium">
                  Kérlek javítsd a hibákat a form elküldése előtt!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="transition-all hover:scale-105"
              >
                Mégse
              </Button>
              <Button 
                type="submit"
                className="transition-all hover:scale-105"
              >
                {editingLog ? "Módosítás" : "Létrehozás"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
