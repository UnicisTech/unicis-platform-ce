import { useCallback } from 'react';
import { platformFleet } from '@/lib/fleet/apiBase';

interface BootstrapFleetResponse {
  success: boolean;
  fleetToken: string;
  secret: {
    id: string;
    secret: string;
  };
}

export const useBootstrapFleet = () => {
  const bootstrapFleet = useCallback(
    async (
      teamId: string,
      password: string
    ): Promise<BootstrapFleetResponse> => {
      const response = await platformFleet('/api/fleet/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, password }),
      });

      return response.json();
    },
    []
  );

  return bootstrapFleet;
};
