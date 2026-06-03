import fleetFetcher from "@/lib/fleet/fleetFetcher";
import { FleetSecret } from "@/types/fleet";
import useSWR, { mutate } from "swr";
import Cookies from "js-cookie";

const FLEET_COOKIE = "ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA";

export const useGetFleetSecret = (teamId: string) => {
  const hasFleetToken = !!Cookies.get(FLEET_COOKIE);
  const url = hasFleetToken ? `/fleet/teams/${teamId}/secret` : null;

  const { data, error, isLoading } = useSWR<FleetSecret>(url, fleetFetcher, {
    shouldRetryOnError: false,
    // 404 is expected when secret doesn't exist yet
    onError: (err) => {
      if (err?.status !== 404 && err?.status !== 401) {
        console.error('[useGetFleetSecret] Error fetching secret:', err);
      }
    }
  });

  const mutateFleetSecret = async () => {
    if (url) mutate(url);
  };

  return {
    isLoading: hasFleetToken ? isLoading : false,
    isError: hasFleetToken ? !!error && error?.status !== 404 && error?.status !== 401 : false,
    secret: data,
    mutateFleetSecret
  };
};
