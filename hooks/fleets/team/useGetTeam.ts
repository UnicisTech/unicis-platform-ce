import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { FleetTeam } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useGetTeam = (teamId: string) => {
  const url = `/team/${teamId}`;
  const { data, error, isLoading } = useSWR<FleetTeam>(url, fleetFetcher, {
    shouldRetryOnError: false,
    // 404 is expected before Fleet enrollment/bootstrap
    onError: (err) => {
      if (err?.status !== 404) {
        console.error('[useGetTeam] Error fetching Fleet team:', err);
      }
    },
  });

  const mutateTeam = async () => {
    mutate(url);
  };

  return {
    fleetTeam: data,
    isLoading: isLoading,
    isError: !!error && error?.status !== 404,
    mutateTeam
  };
};
