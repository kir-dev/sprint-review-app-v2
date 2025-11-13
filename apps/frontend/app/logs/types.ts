import { EventType } from "../events/types"

export enum LogCategory {
  RESPONSIBILITY = "RESPONSIBILITY",
  PROJECT = "PROJECT",
  EVENT = "EVENT",
  MAINTENANCE = "MAINTENANCE",
  SIMONYI = "SIMONYI",
  OTHER = "OTHER",
}

export enum Difficulty {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export enum Position {
  UJONC = "UJONC",
  TAG = "TAG",
  HR_FELELOS = "HR_FELELOS",
  PR_FELELOS = "PR_FELELOS",
  TANFOLYAMFELELOS = "TANFOLYAMFELELOS",
  GAZDASAGIS = "GAZDASAGIS",
  KORVEZETO_HELYETTES = "KORVEZETO_HELYETTES",
  KORVEZETO = "KORVEZETO",
  OREGTAG = "OREGTAG",
  ARCHIVALT = "ARCHIVALT",
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

export interface Log {
  id: number
  date: string
  category: LogCategory
  description: string
  difficulty?: Difficulty
  timeSpent?: number
  userId: number
  projectId?: number
  eventId?: number
  workPeriodId: number
  project?: { id: number; name: string }
  event?: Event
  workPeriod?: { id: number; name: string }
}

export interface Project {
  id: number
  name: string
  description?: string
}

export interface WorkPeriod {
  id: number
  name: string
  startDate: string
  endDate: string
}

export interface LogFormData {
  date: string
  category: LogCategory
  description: string
  difficulty?: Difficulty
  timeSpent: string
  projectId: string
  eventId: string
  workPeriodId: string
}

export interface LogFilters {
  category: string
  projectId: string
  workPeriodId: string
}
