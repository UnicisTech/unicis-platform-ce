import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { StatusLogResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useAssetLogs = (teamId: string, nodeId: string) => {
  
  let url = `/manager/${teamId}/node/${nodeId}/logs`;
  
  const { data, error, isLoading } = useSWR<StatusLogResponse>(url, fleetFetcher);

  const mutateAssetLogs = async () => {
    mutate(url);
  };
  
  return {
    logs: data,
    isLoading: isLoading,
    isError: error,
    mutateAssetLogs
  };
};