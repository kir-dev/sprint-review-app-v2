export interface DashboardSummary {
  totalHours: number;
  activeProjects: number;
  groupTotalHours: number;
  activeContributors: number;
  totalProjectsCount: number;
  averageHoursPerUser: number;
  currentPeriod: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
}

export interface DashboardTopUser {
    name: string;
    hours: number;
}

export interface DashboardProjectItem {
  name: string;
  count: number;
}

export interface DashboardProjectStats {
  topProjects: DashboardProjectItem[];
}

// Re-using generic Log interface but simplified for feed display if needed, 
// or defining a specific one. The backend returns full Log entities.
export interface DashboardFeedItem {
  id: number;
  date: string;
  category: string;
  description: string;
  timeSpent: number;
  project?: {
    name: string;
  };
  user?: {
    fullName: string;
  };
}

export interface CategoryBreakdownData {
  name: string;
  value: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface DashboardEvent {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: 'KIR_DEV' | 'SIMONYI'; // Adjust based on EventType enum
}

export interface DashboardEventStats {
  upcoming: DashboardEvent[];
  past: DashboardEvent[];
}
