import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ErrorAlertProps {
  error: string | null
  onClose: () => void
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center justify-between animate-slide-in-top shadow-lg">
      <span className="animate-fade-in">{error}</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClose}
        className="transition-all hover:scale-110"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
