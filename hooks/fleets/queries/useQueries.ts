import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { QuerysResponse } from '@/types/fleet';
import useSWR, { mutate } from 'swr';

export const useQueries = (teamId: string) => {
  const url = `/manager/${teamId}/queries`;
  const { data, error, isLoading } = useSWR<QuerysResponse>(url, fleetFetcher);

  const mutateQueries = async () => {
    mutate(url);
  };

  return {
    queries: data?.queries ?? [],
    isLoading: isLoading,
    isError: error,
    mutateQueries,
  };
};
