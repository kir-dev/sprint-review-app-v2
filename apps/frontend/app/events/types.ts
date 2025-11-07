export enum EventType {
  KIR_DEV = "KIR_DEV",
  SIMONYI = "SIMONYI",
}

export interface Event {
  id: number
  name: string
  date: string
  type: EventType
  _count?: {
    logs: number
  }
}

export interface EventFormData {
  name: string
  date: string
  type: string
}
