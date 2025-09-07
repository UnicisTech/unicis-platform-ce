import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { FleetSecret } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useGetFleetSecret = (teamId: string) => {
  const url = `/fleet/teams/${teamId}/secret`
  const { data, error, isLoading } = useSWR<FleetSecret>(url, fleetFetcher);

  const mutateFleetSecret = async () => {
    mutate(url);
  };

  return {
    isLoading: isLoading,
    isError: error,
    secret: data,
    mutateFleetSecret
  };
};