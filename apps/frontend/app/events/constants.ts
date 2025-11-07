import { EventType } from "./types"

export const eventTypeLabels: Record<EventType, string> = {
  KIR_DEV: "Kir-Dev",
  SIMONYI: "Simonyi",
}

export const eventTypeColors: Record<EventType, string> = {
  KIR_DEV: "bg-primary/10 text-primary border-primary/20",
  SIMONYI: "bg-green-500/10 text-green-500 border-green-500/20",
}
