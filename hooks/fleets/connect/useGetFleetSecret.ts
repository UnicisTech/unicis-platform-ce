import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { FleetSecret } from "@/types/fleet";
import useSWR, { mutate } from "swr";

export const useGetFleetSecret = (teamId: string) => {
  const url = `/fleet/teams/${teamId}/secret`
  const { data, error, isLoading } = useSWR<FleetSecret>(url, fleetFetcher, {
    shouldRetryOnError: false,
    // 404 is expected when secret doesn't exist yet
    onError: (err) => {
      if (err?.status !== 404) {
        console.error('[useGetFleetSecret] Error fetching secret:', err);
      }
    }
  });

  const mutateFleetSecret = async () => {
    mutate(url);
  };

  return {
    isLoading: isLoading,
    isError: error && error?.status !== 404, // Don't treat 404 as error
    secret: data,
    mutateFleetSecret
  };
};