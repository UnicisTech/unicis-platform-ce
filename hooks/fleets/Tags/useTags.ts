import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { TagsResponse } from '@/types/fleet';
import useSWR, { mutate } from 'swr';

export const useTags = (teamId: string) => {
  const url = `/manager/${teamId}/tags`;
  const { data, error, isLoading } = useSWR<TagsResponse>(url, fleetFetcher);

  const mutateTags = async () => {
    mutate(url);
  };

  return {
    tags: data?.tags ?? [],
    isLoading: isLoading,
    isError: error,
    mutateTags,
  };
};
