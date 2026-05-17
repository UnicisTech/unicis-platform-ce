import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { NodesResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useNodes = (teamId: string, status?: string, options?: { skip?: boolean }) => {

  let url = `/manager/${teamId}/nodes`;

  if (status && status !== 'all') {
    url = `/manager/${teamId}/nodes/${status}`;
  }

  // Skip fetching if skip option is true (e.g., for auditor role)
  const { data, error, isLoading } = useSWR<NodesResponse>(
    options?.skip ? null : url,
    fleetFetcher,
    {
      onError: (err) => {
        console.error('[useNodes] Error fetching nodes:', err);
      }
    }
  );

  const mutateNodes = async () => {
    mutate(url);
  };

  return {
    nodes: data?.nodes,
    isLoading: isLoading,
    isError: error,
    mutateNodes
  };
};