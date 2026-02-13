
import { useCallback, useEffect, useState } from 'react';
import { Feature } from '../types';

interface UseFeatureDataReturn {
  features: Feature[];
  isLoading: boolean;
  error: string | null;
  loadFeatures: () => Promise<void>;
  createFeature: (data: Partial<Feature>) => Promise<boolean>;
  updateFeature: (id: number, data: Partial<Feature>) => Promise<boolean>;
  deleteFeature: (id: number) => Promise<boolean>;
  setError: (error: string | null) => void;
}

export function useFeatureData(projectId: string, token: string | null): UseFeatureDataReturn {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeatures = useCallback(async () => {
    if (!token || !projectId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/features`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch features');

      const data = await response.json();
      setFeatures(data);
    } catch (err) {
      console.error('Error loading features:', err);
      setError('Nem sikerült betölteni a feladatokat');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const createFeature = async (data: Partial<Feature>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/features`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create feature');
      }

      await loadFeatures();
      return true;
    } catch (err: unknown) {
      console.error('Error creating feature:', err);
      const errorMessage = err instanceof Error ? err.message : 'Nem sikerült létrehozni a feladatot';
      setError(errorMessage);
      return false;
    }
  };

  const updateFeature = async (id: number, data: Partial<Feature>) => {
    try {
        // Optimistic update for status changes (drag and drop)
        if (data.status) {
            setFeatures(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
        }

      const response = await fetch(`/api/features/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
         // Revert on error
         if (data.status) loadFeatures();
         throw new Error('Failed to update feature');
      }

      // If it wasn't a status change (e.g. edit details), reload to get full data
      if (!data.status) {
          await loadFeatures();
      }
      return true;
    } catch (err: unknown) {
      console.error('Error updating feature:', err);
      const errorMessage = err instanceof Error ? err.message : 'Nem sikerült frissíteni a feladatot';
      setError(errorMessage);
      return false;
    }
  };

  const deleteFeature = async (id: number) => {
    try {
      const response = await fetch(`/api/features/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete feature');

      setFeatures(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting feature:', err);
      const errorMessage = err instanceof Error ? err.message : 'Nem sikerült törölni a feladatot';
      setError(errorMessage);
      return false;
    }
  };

  return {
    features,
    isLoading,
    error,
    loadFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    setError
  };
}
