import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { DistributedQueryResult } from '@/types/fleet';
import useSWR, { mutate } from 'swr';

export const useGetDistributedIdResult = (
  teamId?: string,
  distributorId?: string,
  distributorStatus: 'new' | 'pending' | 'complete' | 'failed' = 'complete',
  page = 1
) => {
  const url =
    teamId && distributorId
      ? `/manager/${teamId}/queries/distributed/results/${distributorId}/${distributorStatus}/${page}`
      : null;
  const { data, error, isLoading } = useSWR<DistributedQueryResult>(
    url,
    fleetFetcher
  );

  const mutateDistributorResult = async () => {
    if (url) mutate(url);
  };

  return {
    distributorsResult: data,
    isLoading,
    isError: error,
    mutateDistributorResult,
  };
};
