import { FleetAccess } from '@/types/fleet';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  fleetAccessTokenCookieName,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';

export const useVerifyFleetAsses = () => {
  const [access, setAccess] = useState<FleetAccess>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError(null);

      try {
        const hasFleetToken = Boolean(
          Cookies.get(fleetAccessTokenCookieName) ||
            Cookies.get(legacyFleetAccessTokenCookieName)
        );

        if (!hasFleetToken) {
          setAccess(undefined);
          return;
        }

        const response = await fetch('/api/fleet/access/verify', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error || 'Fleet verify failed');
        }

        const data: FleetAccess = await response.json();
        setAccess(data);
      } catch {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  return { access, isLoading, isError };
};
