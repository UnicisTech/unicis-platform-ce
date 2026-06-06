import fleetFetcher from '@/lib/fleet/fleetFetcher';
import useSWR, { mutate } from 'swr';

export const useAssetConfig = (teamId: string, nodeId: string) => {
  let url = `/manager/${teamId}/node/${nodeId}/config`;

  const { data, error, isLoading } = useSWR<any>(url, fleetFetcher);

  const mutateAssetConfig = async () => {
    mutate(url);
  };

  return {
    config: data,
    isLoading: isLoading,
    isError: error,
    mutateAssetConfig,
  };
};
