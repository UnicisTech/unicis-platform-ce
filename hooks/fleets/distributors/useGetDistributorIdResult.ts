import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { DistributedQueryResult } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useGetDistributedIdResult = (teamId: string, distributorId: string, distributorStatus: 'new' | 'pending' | 'complete' | 'failed') => {
  const url = `/manager/${teamId}/queries/distributed/results/${distributorId}`;
  const { data, error, isLoading } = useSWR<DistributedQueryResult>(url, fleetFetcher);

  const mutateDistributorResult = async () => {
    mutate(url);
  };

  return {
    distributorsResult: data,
    isLoading,
    isError: error,
    mutateDistributorResult
  };
};