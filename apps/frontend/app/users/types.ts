export interface User {
  id: number;
  email: string;
  simonyiEmail?: string;
  githubUsername?: string;
  fullName: string;
  profileImage?: string;
  position: string;
  positionDetails?: {
    id: number;
    name: string;
    label: string;
    color: string;
    canManageSettings: boolean;
    canExportLogs: boolean;
    canManageEvents: boolean;
    canManageProjects: boolean;
    isLeader: boolean;
  };
  createdAt: string;
  _count?: {
    logs: number;
    managedProjects: number;
    projects: number;
  };
}
