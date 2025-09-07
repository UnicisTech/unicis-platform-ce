import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { NodesResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useNodes = (teamId: string, status?: string) => {
  
  let url = `/manager/${teamId}/nodes`;

  if (status && status !== 'all') {
    url = `/manager/${teamId}/nodes/status/${status}`;
  }
  
  const { data, error, isLoading } = useSWR<NodesResponse>(url, fleetFetcher);

  const mutateNodes = async () => {
    mutate(url);
  };
  
  return {
    nodes: data?.nodes!,
    isLoading: isLoading,
    isError: error,
    mutateNodes
  };
};