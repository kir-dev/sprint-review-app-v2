import { Position } from "../logs/types"

export interface User {
  id: number
  email: string
  simonyiEmail?: string
  githubUsername?: string
  fullName: string
  profileImage?: string
  position: Position
  createdAt: string
  _count?: {
    logs: number
    managedProjects: number
    projects: number
  }
}
