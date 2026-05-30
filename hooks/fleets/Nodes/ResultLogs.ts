import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { ResultLogResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useAssetActivities = (teamId: string, nodeId: string) => {
  // `timestamp=0` forces backend to return the full history for this asset
  // instead of the default "last 7 days" window.
  const url = `/manager/${teamId}/node/${nodeId}/activity?timestamp=0`;
  
  const { data, error, isLoading } = useSWR<ResultLogResponse>(url, fleetFetcher);

  const mutateAssetActivities = async () => {
    mutate(url);
  };
  
  return {
    result: data,
    isLoading: isLoading,
    isError: error,
    mutateAssetActivities
  };
};
