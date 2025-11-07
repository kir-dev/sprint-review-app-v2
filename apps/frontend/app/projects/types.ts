import { Position } from "../logs/types"

export interface Project {
  id: number
  name: string
  description?: string
  githubUrl?: string
  projectManagerId?: number
  projectManager?: User
  members?: User[]
  createdAt: string
  _count?: {
    logs: number
    members: number
  }
}

export interface User {
  id: number
  email: string
  fullName: string
  profileImage?: string
  position: Position
}

export interface ProjectFormData {
  name: string
  description: string
  githubUrl: string
  projectManagerId: string
  memberIds: string[]
}
