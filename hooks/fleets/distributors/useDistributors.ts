import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { DistributedQueryTaskResponse } from '@/types/fleet';
import useSWR, { mutate } from 'swr';

export const useDistributors = (teamId?: string) => {
  const url = teamId ? `/manager/${teamId}/queries/distributed` : null;
  const { data, error, isLoading } = useSWR<DistributedQueryTaskResponse>(
    url,
    fleetFetcher
  );

  const mutateDistributorsTasks = async () => {
    if (url) mutate(url);
  };

  return {
    tasks: data?.tasks ?? [],
    isLoading: isLoading,
    isError: error,
    mutateDistributorsTasks,
  };
};
