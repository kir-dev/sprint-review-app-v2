'use client';

import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ErrorAlert } from '@/components/ErrorAlert';
import { MobileFloatingActionButton } from "@/components/MobileFloatingActionButton";
import { LoadingLogo } from "@/components/ui/LoadingLogo";
import { useAuth } from '@/context/AuthContext';
import { Plus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEventData } from '../events/hooks/useEventData';
import { LogDialog } from './components/LogDialog';
import { LogFilters } from './components/LogFilters';
import { LogsHeader } from './components/LogsHeader';
import { LogsList } from './components/LogsList';
import { useLogData } from './hooks/useLogData';
import { useLogForm } from './hooks/useLogForm';
import { useLogSubmit } from './hooks/useLogSubmit';
import { LogFilters as LogFiltersType, LogFormData } from './types';
import { filterLogs } from './utils/log-helpers';

export default function LogsPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Custom hooks
  const {
    logs,
    setLogs,
    projects,
    workPeriods,
    currentWorkPeriod,
    isLoading,
    error,
    setError,
    loadData,
  } = useLogData(token, user?.id);
  const {
    isDialogOpen,
    editingLog,
    formData,
    setFormData,
    openDialog,
    closeDialog,
  } = useLogForm(workPeriods, currentWorkPeriod);
  const { events } = useEventData(token);

  const { handleSubmit: submitLog } = useLogSubmit({
    token,
    user,
    workPeriods,
    onSuccess: async () => {
      await loadData();
      closeDialog();
    }
  });

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltersMounted, setIsFiltersMounted] = useState(false);
  const [filters, setFilters] = useState<LogFiltersType>({
    category: '',
    projectId: '',
    workPeriodId: '',
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push('/login');
    }
  }, [token, isAuthLoading, router]);

  // Handle filter animation and mounting
  useEffect(() => {
    if (showFilters) {
      setIsFiltersMounted(true);
    } else if (isFiltersMounted) {
      // Wait for slide-out animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsFiltersMounted(false);
      }, 200); // Match the slide-out animation duration
      return () => clearTimeout(timer);
    }
  }, [showFilters, isFiltersMounted]);

  // Handlers
  async function handleSubmit(data: LogFormData) {
    await submitLog(data, editingLog);
  }

  function handleDeleteClick(id: number) {
    setLogToDelete(id);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!logToDelete) return;

    try {
      const response = await fetch(`/api/logs/${logToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setLogs(logs.filter((log) => log.id !== logToDelete));
        setDeleteConfirmOpen(false);
        setLogToDelete(null);
      } else {
        setError('Nem sikerült törölni a bejegyzést');
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      setError('Nem sikerült törölni a bejegyzést. Próbáld újra.');
    }
  }

  function handleDeleteCancel() {
    setDeleteConfirmOpen(false);
    setLogToDelete(null);
  }

  // Computed values
  const filteredLogs = filterLogs(logs, filters);



  // Loading state
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingLogo size={150} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-0 md:pt-4 max-w-7xl mx-auto">
      <LogsHeader
        onCreateLog={() => openDialog()}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {isFiltersMounted && (
        <LogFilters
          filters={filters}
          projects={projects}
          workPeriods={workPeriods}
          onFiltersChange={setFilters}
          onClearFilters={() =>
            setFilters({ category: '', projectId: '', workPeriodId: '' })
          }
          isVisible={showFilters}
        />
      )}

      <ErrorAlert error={error} onClose={() => setError(null)} />

      <LogsList
        logs={filteredLogs}
        isLoading={isLoading}
        onCreateLog={() => openDialog()}
        onEditLog={openDialog}
        onDeleteLog={handleDeleteClick}
      />

      <LogDialog
        isOpen={isDialogOpen}
        editingLog={editingLog}
        formData={formData}
        projects={projects}
        events={events as any}
        workPeriods={workPeriods}

        onSubmit={handleSubmit}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Bejegyzés Törlése"
        description="Biztosan törölni szeretnéd ezt a bejegyzést? Ez a művelet nem visszavonható."
      />

      {!isDialogOpen && !deleteConfirmOpen && (
        <MobileFloatingActionButton onClick={() => openDialog()} icon={Plus} />
      )}
    </div>
  );
}
