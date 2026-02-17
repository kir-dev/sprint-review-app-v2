'use client';

import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DifficultyBreakdown } from "@/components/dashboard/DifficultyBreakdown";
import { EventList } from "@/components/dashboard/EventList";
import { PersonalKPI } from "@/components/dashboard/PersonalKPI";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { TopUsersList } from "@/components/dashboard/TopUsersList";
import { WorkPeriodProgress } from "@/components/dashboard/WorkPeriodProgress";
import { MobileFloatingActionButton } from "@/components/MobileFloatingActionButton";
import { Button } from "@/components/ui/button";
import { LoadingLogo } from "@/components/ui/LoadingLogo";
import { useAuth } from "@/context/AuthContext";
import { CategoryBreakdownData, DashboardEventStats, DashboardProjectItem, DashboardSummary, DashboardTopUser, HeatmapData } from "@/types/dashboard";
import { LayoutDashboard, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEventData } from "../events/hooks/useEventData";
import { LogDialog } from "../logs/components/LogDialog";
import { useLogData } from "../logs/hooks/useLogData";
import { useLogForm } from "../logs/hooks/useLogForm";
import { useLogSubmit } from "../logs/hooks/useLogSubmit";

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projectsStats, setProjectsStats] = useState<{ topProjects: DashboardProjectItem[] } | null>(null);
  const [topUsers, setTopUsers] = useState<DashboardTopUser[]>([]);
  const [stats, setStats] = useState<{ categoryBreakdown: CategoryBreakdownData[], heatmapData: HeatmapData[], difficultyBreakdown: {name: string, value: number}[] } | null>(null);
  const [eventStats, setEventStats] = useState<DashboardEventStats | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Log creation hooks
  const { projects, workPeriods, currentWorkPeriod } = useLogData(token, user?.id);
  const { events } = useEventData(token);
  const {
      isDialogOpen,
      formData,
      openDialog,
      closeDialog,
    } = useLogForm(workPeriods, currentWorkPeriod);

  const { handleSubmit } = useLogSubmit({
    token,
    user,
    workPeriods,
    onSuccess: () => {
      closeDialog();
      fetchDashboardData();
    }
  });

  const onLogSubmit = async (data: any) => {
    await handleSubmit(data);
  };

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  const fetchDashboardData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [summaryRes, projectsRes, topUsersRes, statsRes, eventsRes] = await Promise.all([
          fetch('/api/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/projects', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/top-users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/dashboard/events', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (projectsRes.ok) setProjectsStats(await projectsRes.json());
      if (topUsersRes.ok) setTopUsers(await topUsersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (eventsRes.ok) setEventStats(await eventsRes.json());

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
        fetchDashboardData();
    }
  }, [token]);



  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={60} />
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return (
    <div className="p-4 md:p-0 md:pt-4 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:scale-110 transition-transform">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Üdv újra, {user.fullName}! Itt az összefoglalód.</p>
          </div>
        </div>
        
        <Button 
            onClick={() => openDialog()}
            className="transition-all hover:scale-105 hidden md:flex"
        >
            <Plus className="h-4 w-4 mr-2" />
            Új Bejegyzés
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column (Main Stats) */}
        <div className="md:col-span-8 space-y-6">
            <PersonalKPI 
                summary={summary}
                loading={loading}
            />
            
            <ActivityHeatmap 
                data={stats?.heatmapData || []}
                loading={loading}
                startDate={summary?.currentPeriod?.startDate}
                endDate={summary?.currentPeriod?.endDate}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <ProjectList 
                    projects={projectsStats?.topProjects || []}
                    loading={loading}
                />
                <CategoryBreakdown 
                    data={stats?.categoryBreakdown || []}
                    loading={loading}
                />
            </div>
        </div>

        {/* Right Column (Side Widgets) */}
        <div className="md:col-span-4 space-y-6">
            <WorkPeriodProgress 
                currentPeriod={summary?.currentPeriod || null}
                loading={loading}
            />

            <EventList 
                stats={eventStats}
                loading={loading}
            />
            
            <TopUsersList
                users={topUsers}
                loading={loading}
            />

            <DifficultyBreakdown 
                data={stats?.difficultyBreakdown || []}
                loading={loading}
            />
        </div>
      </div>

      <LogDialog
        isOpen={isDialogOpen}
        editingLog={null}
        formData={formData}
        projects={projects}
        events={events as any}
        workPeriods={workPeriods}

        onSubmit={onLogSubmit}
        onClose={closeDialog}
      />

      {!isDialogOpen && <MobileFloatingActionButton onClick={() => openDialog()} icon={Plus} />}
    </div>
  );
}
