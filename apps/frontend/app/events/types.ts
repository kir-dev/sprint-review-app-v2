export enum EventType {
  KIR_DEV = "KIR_DEV",
  SIMONYI = "SIMONYI",
}

export interface Event {
  id: number
  name: string
  startDate: string
  endDate: string
  type: EventType
  _count?: {
    logs: number
  }
}

export interface EventFormData {
  name: string
  startDate: string
  endDate: string
  type: string
}
