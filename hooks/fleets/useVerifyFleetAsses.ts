import useSWR from 'swr';
import { platformFleet, type FleetApiError } from '@/lib/fleet/apiBase';
import type { FleetAccess } from '@/types/fleet';

export const useVerifyFleetAsses = () => {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<FleetAccess | null>(
      '/api/fleet/access/verify',
      async (endpoint: string) => {
        try {
          const response = await platformFleet(endpoint, { method: 'GET' });
          return response.json();
        } catch (runtimeError) {
          if ((runtimeError as FleetApiError).status === 401) return null;
          throw runtimeError;
        }
      },
      { shouldRetryOnError: false }
    );

  return {
    access: data ?? undefined,
    isLoading,
    isValidating,
    isError: error ? 'An unexpected error occurred.' : null,
    isNotConfigured: (error as FleetApiError | undefined)?.status === 503,
    mutateFleetAccess: mutate,
  };
};
