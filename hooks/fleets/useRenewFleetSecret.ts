import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useRenewFleetSecret = () => {
  const renewFleetSecret = async (fleetTeamId: string, accessPhrase: string) => {
    const response = await fleetV1(`/fleet/teams/${fleetTeamId}/secret/renew`, {
      method: 'POST',
      headers: fleetAuthAPIHeaders(accessPhrase),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error renewing fleet secret');
    }

    return response.json();
  };

  return renewFleetSecret;
};
