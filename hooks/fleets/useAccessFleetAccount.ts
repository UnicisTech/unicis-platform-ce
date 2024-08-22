import { defaultHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { LoginResponse } from "@/types";
import { useCallback } from "react";

export const useAccessFleetAccount = () => {
  const accessFleetAccount = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fleetV1(`/account/access`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error accessing fleet account');
    }

    return response.json();
  }, []);

  return accessFleetAccount;
};