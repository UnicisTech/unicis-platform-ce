import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { PacksResponse } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const usePacks = (teamId: string) => {
  
  const url = `/manager/${teamId}/packs`;

  const { data, error, isLoading } = useSWR<PacksResponse>(url, fleetFetcher);

  const mutatePacks = async () => {
    mutate(url);
  };

  return {
    packs: data?.packs!,
    isLoading: isLoading,
    isError: error,
    mutatePacks
  };
};