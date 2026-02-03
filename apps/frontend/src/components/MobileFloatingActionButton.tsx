"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface MobileFloatingActionButtonProps {
  onClick: () => void
  label?: string
  className?: string
  icon?: React.ElementType
}

export function MobileFloatingActionButton({
  onClick,
  label = "Új hozzáadása",
  className,
  icon: Icon = Plus
}: MobileFloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl md:hidden z-50 animate-in zoom-in duration-300",
        className
      )}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </Button>
  )
}
