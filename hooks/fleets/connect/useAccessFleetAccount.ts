import { defaultHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';
import { useCallback } from 'react';

export interface FleetLoginResponse {
  msg: string;
  access_token: string;
  refresh_token: string;
  user: any;
  fleet_access: {
    secret_key: string;
    is_active: boolean;
    expiration_date: string;
  };
  is_temporary_password?: boolean;
}

export const useAccessFleetAccount = () => {
  const accessFleetAccount = useCallback(
    async (email: string, password: string): Promise<FleetLoginResponse> => {
      const response = await fleetV1(`/account/access`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.msg || 'Fleet login failed');
      }

      return data;
    },
    []
  );

  return accessFleetAccount;
};
