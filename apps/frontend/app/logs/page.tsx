'use client';

import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEventData } from '../events/hooks/useEventData';
import { LogDialog } from './components/LogDialog';
import { LogFilters } from './components/LogFilters';
import { LogsHeader } from './components/LogsHeader';
import { LogsList } from './components/LogsList';
import { useLogData } from './hooks/useLogData';
import { useLogForm } from './hooks/useLogForm';
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
    if (!user?.id) return;

    const resolvedWorkPeriodId = data.workPeriodId
      ? parseInt(data.workPeriodId)
      : (findWorkPeriodIdForDate(data.date, workPeriods) ?? undefined);

    if (!resolvedWorkPeriodId) {
      setError('Ehhez a dátumhoz nem található work period');
      return;
    }

    const payload = {
      date: data.date,
      category: data.category,
      description: data.description,
      difficulty: data.difficulty || undefined,
      timeSpent: data.timeSpent ? data.timeSpent : undefined,
      userId: user.id,
      projectId: data.projectId ? parseInt(data.projectId) : null,
      eventId: data.eventId ? parseInt(data.eventId) : null,
      workPeriodId: resolvedWorkPeriodId,
    };

    try {
      const url = editingLog ? `/api/logs/${editingLog.id}` : '/api/logs';
      const method = editingLog ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadData();
        closeDialog();
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to save log');
      }
    } catch (err) {
      console.error('Error saving log:', err);
      setError('Failed to save log. Please try again.');
    }
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
        setError('Failed to delete log');
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      setError('Failed to delete log. Please try again.');
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
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
        events={events}
        workPeriods={workPeriods}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeDialog}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Log"
        description="Are you sure you want to delete this log? This action cannot be undone."
      />
    </div>
  );
}
