import { defaultHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { LoginResponse } from "@/types";
import { useCallback } from "react";

export const useAccessFleetAccount = () => {
  const accessFleetAccount = useCallback(async (id: string, email: string, password: string, expiration: string): Promise<LoginResponse> => {

    const response = await fleetV1(`/account/access`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ id, email, password, expiration }),
    });

    if (!response.ok) {
      const data = await response.json();
    }

    return response.json();
  }, []);

  return accessFleetAccount;
};