import { useCallback } from 'react';
import { platformFleet } from '@/lib/fleet/apiBase';

export const useCheckFleetAccount = () => {
  const checkFleetAccount = useCallback(async (): Promise<boolean> => {
    try {
      const response = await platformFleet('/api/fleet/check-account', {
        method: 'GET',
      });
      const data = await response.json();
      return data.exists || false;
    } catch {
      return false;
    }
  }, []);

  return checkFleetAccount;
};
