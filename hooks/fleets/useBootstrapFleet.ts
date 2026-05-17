import { useCallback } from 'react';

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
    async (teamId: string, password: string): Promise<BootstrapFleetResponse> => {
      console.log('[useBootstrapFleet] Calling /api/fleet/bootstrap with teamId:', teamId);

      const response = await fetch('/api/fleet/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, password }),
      });

      console.log('[useBootstrapFleet] Response status:', response.status);
      console.log('[useBootstrapFleet] Response ok:', response.ok);

      const data = await response.json();
      console.log('[useBootstrapFleet] Response data:', data);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to bootstrap Fleet');
      }

      return data;
    },
    []
  );

  return bootstrapFleet;
};
