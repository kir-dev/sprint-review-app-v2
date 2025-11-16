"use client"

import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Calendar22Props = {
  // date value in YYYY-MM-DD format (compatible with input[type=date])
  value?: string | null
  // called with date in YYYY-MM-DD format or empty string when cleared
  onChange?: (dateString: string) => void
  onBlur?: () => void
  id?: string
  required?: boolean
  className?: string
  // custom class for the popover content (controls popover width)
  popoverClassName?: string
}

export function Calendar22({ value, onChange, onBlur, id, className, popoverClassName }: Calendar22Props) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  // keep internal state in sync if parent changes the value
  React.useEffect(() => {
    if (value) {
      const parsed = new Date(value)
      if (!isNaN(parsed.getTime())) setDate(parsed)
    } else {
      setDate(undefined)
    }
  }, [value])

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id ?? "date"}
            className={`${className ?? 'w-60'} justify-between font-normal`}
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
  <PopoverContent className={`${popoverClassName ?? 'w-auto'} overflow-hidden p-0`} align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            className="w-full"
            classNames={{ root: 'w-full' }}
            weekStartsOn={1}
            onSelect={(selected: Date | undefined) => {
              setDate(selected)
              setOpen(false)
              const iso = selected ? selected.toISOString().slice(0, 10) : ''
              onChange?.(iso)
              // notify parent that the field lost focus (behaves like onBlur)
              onBlur?.()
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
