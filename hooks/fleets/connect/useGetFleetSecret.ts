import useSWR, { mutate } from 'swr';
import { platformFleet, type FleetApiError } from '@/lib/fleet/apiBase';
import type { FleetSecret } from '@/types/fleet';

export const useGetFleetSecret = (teamId: string) => {
  const url = teamId
    ? `/api/fleet/secret?teamId=${encodeURIComponent(teamId)}`
    : null;
  const { data, error, isLoading } = useSWR<FleetSecret | null>(
    url,
    async (endpoint: string) => {
      const response = await platformFleet(endpoint, { method: 'GET' });
      return response.json();
    },
    {
      shouldRetryOnError: false,
      onError: (runtimeError: FleetApiError) => {
        if (runtimeError?.status !== 404 && runtimeError?.status !== 401) {
          console.error(
            '[useGetFleetSecret] Error fetching secret:',
            runtimeError
          );
        }
      },
    }
  );
  const typedError = error as FleetApiError | undefined;

  const mutateFleetSecret = async (nextSecret?: FleetSecret | null) => {
    if (!url) return;

    if (nextSecret !== undefined) {
      await mutate(url, nextSecret, false);
      return;
    }

    await mutate(url);
  };

  return {
    isLoading,
    isError:
      !!typedError && typedError.status !== 404 && typedError.status !== 401,
    secret: data,
    mutateFleetSecret,
  };
};
