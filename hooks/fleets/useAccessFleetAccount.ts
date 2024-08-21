import { defaultHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useAccessFleetAccount = () => {
  const accessFleetAccount = async (email: string, password: string) => {
    const response = await fleetV1(`/account/access`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { fleetId: data.user.id, secret: data.fleet_access.secret_key };
    } else {
      console.error('Error accessing fleet account:', data);
      throw new Error('Failed to access fleet account');
    }
  };

  return accessFleetAccount;
};
