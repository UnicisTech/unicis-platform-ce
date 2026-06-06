import fleetFetcher from '@/lib/fleet/fleetFetcher';
import { FleetSecret } from '@/types/fleet';
import useSWR, { mutate } from 'swr';
import Cookies from 'js-cookie';
import {
  fleetAccessTokenCookieName,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';

export const useGetFleetSecret = (teamId: string) => {
  const hasFleetToken = Boolean(
    Cookies.get(fleetAccessTokenCookieName) ||
      Cookies.get(legacyFleetAccessTokenCookieName)
  );
  const url = hasFleetToken ? `/fleet/teams/${teamId}/secret` : null;

  const { data, error, isLoading } = useSWR<FleetSecret>(url, fleetFetcher, {
    shouldRetryOnError: false,
    onError: (err) => {
      if (err?.status !== 404 && err?.status !== 401) {
        console.error('[useGetFleetSecret] Error fetching secret:', err);
      }
    },
  });

  const mutateFleetSecret = async () => {
    if (url) mutate(url);
  };

  return {
    isLoading: hasFleetToken ? isLoading : false,
    isError: hasFleetToken
      ? !!error && error?.status !== 404 && error?.status !== 401
      : false,
    secret: data,
    mutateFleetSecret,
  };
};
