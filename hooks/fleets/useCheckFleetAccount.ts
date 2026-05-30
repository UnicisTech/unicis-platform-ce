import { useCallback } from 'react';

export const useCheckFleetAccount = () => {
  const checkFleetAccount = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/fleet/check-account');
      const data = await response.json();
      return data.exists || false;
    } catch {
      return false;
    }
  }, []);

  return checkFleetAccount;
};
