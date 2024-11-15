import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { ResultLogResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useAssetActivities = (teamId: string, nodeId: string) => {
  
  let url = `/manager/${teamId}/node/${nodeId}/activity`;
  
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