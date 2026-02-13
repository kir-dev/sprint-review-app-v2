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

export type FeatureStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type FeaturePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Feature {
  id: number;
  title: string;
  description?: string;
  status: FeatureStatus;
  priority?: FeaturePriority;
  projectId: number;
  assigneeId?: number;
  assignee?: {
    id: number;
    fullName: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalLogs: number;
  totalTimeSpent: number;
  featureCounts: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    BLOCKED: number;
  };
}
