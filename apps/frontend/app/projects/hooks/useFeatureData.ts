import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useFeatureData(
  projectId: string,
  token: string | null,
): UseFeatureDataReturn {
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const {
    data: features = [],
    isLoading,
    error: queryError,
  } = useQuery<Feature[]>({
    queryKey: ['projects', projectId, 'features'],
    queryFn: () =>
      fetch(`/api/projects/${projectId}/features`, { headers }).then((res) =>
        res.json(),
      ),
    enabled: !!token && !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Feature>) =>
      fetch(`/api/projects/${projectId}/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create feature');
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'features'],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Feature> }) =>
      fetch(`/api/features/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update feature');
        return res.json();
      }),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: ['projects', projectId, 'features'],
      });
      const previousFeatures = queryClient.getQueryData<Feature[]>([
        'projects',
        projectId,
        'features',
      ]);

      if (previousFeatures) {
        queryClient.setQueryData(
          ['projects', projectId, 'features'],
          previousFeatures.map((f) => (f.id === id ? { ...f, ...data } : f)),
        );
      }

      return { previousFeatures };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(
          ['projects', projectId, 'features'],
          context.previousFeatures,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'features'],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/features/${id}`, {
        method: 'DELETE',
        headers,
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete feature');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'features'],
      });
    },
  });

  return {
    features,
    isLoading,
    error: queryError ? 'Nem sikerült betölteni a feladatokat' : null,
    loadFeatures: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'features'],
      });
    },
    createFeature: async (data) => {
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    updateFeature: async (id, data) => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      }
    },
    deleteFeature: async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    setError: () => {},
  };
}
