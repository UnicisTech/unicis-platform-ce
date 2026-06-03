import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { FleetTeam } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useGetTeam = (teamId: string) => {
  const url = `/team/${teamId}`;
  const { data, error, isLoading } = useSWR<FleetTeam>(url, fleetFetcher);

  const mutateTeam = async () => {
    mutate(url);
  };

  return {
    fleetTeam: data,
    isLoading: isLoading,
    isError: error,
    mutateTeam
  };
};