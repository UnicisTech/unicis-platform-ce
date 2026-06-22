import { FleetSecret } from '@/types/fleet';
import useSWR, { mutate } from 'swr';
import Cookies from 'js-cookie';
import {
  fleetAccessTokenCookieName,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';

type FleetSecretError = Error & {
  status?: number;
};

export const useGetFleetSecret = (teamId: string) => {
  const hasFleetToken = Boolean(
    Cookies.get(fleetAccessTokenCookieName) ||
      Cookies.get(legacyFleetAccessTokenCookieName)
  );
  const url =
    hasFleetToken && teamId
      ? `/api/fleet/secret?teamId=${encodeURIComponent(teamId)}`
      : null;

  const { data, error, isLoading } = useSWR<FleetSecret>(
    url,
    async (fetchUrl: string) => {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const err = new Error(
          'Failed to fetch Fleet secret'
        ) as FleetSecretError;
        err.status = response.status;
        throw err;
      }

      return response.json();
    },
    {
      shouldRetryOnError: false,
      onError: (err: FleetSecretError) => {
        if (err?.status !== 404 && err?.status !== 401) {
          console.error('[useGetFleetSecret] Error fetching secret:', err);
        }
      },
    }
  );

  const typedError = error as FleetSecretError | undefined;

  const mutateFleetSecret = async () => {
    if (!url) {
      return;
    }

    await mutate(url);
  };

  return {
    isLoading: hasFleetToken ? isLoading : false,
    isError: hasFleetToken
      ? !!typedError && typedError.status !== 404 && typedError.status !== 401
      : false,
    secret: data,
    mutateFleetSecret,
  };
};
