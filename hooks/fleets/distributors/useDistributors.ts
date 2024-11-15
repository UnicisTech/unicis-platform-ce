import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { DistributedQueryTaskResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useDistributors = (teamId: string) => {
  const url = `/manager/${teamId}/queries/distributed`;
  const { data, error, isLoading } = useSWR<DistributedQueryTaskResponse>(url, fleetFetcher);

  const mutateDistributorsTasks = async () => {
    mutate(url);
  };
  
  return {
    tasks: data?.tasks!,
    isLoading: isLoading,
    isError: error,
    mutateDistributorsTasks,
  };
};