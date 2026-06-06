import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';
import { FleetAccess } from '@/types/fleet';
import { useEffect, useState } from 'react';

export const useVerifyFleetAsses = () => {
  const [access, setAccess] = useState<FleetAccess>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/account/access/verify`, {
          method: 'GET',
          headers: await fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          await response.json();
        }

        const data: FleetAccess = await response.json();
        console.log('data', data);
        setAccess(data);
      } catch {
        setError('An unexpecte derror occurred.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  return { access, isLoading, isError };
};
