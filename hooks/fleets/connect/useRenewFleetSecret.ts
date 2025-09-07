import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useRenewFleetSecret = () => {
  const renewFleetSecret = async (fleetTeamId: string) => {
    const response = await fleetV1(`/fleet/teams/${fleetTeamId}/secret/renew`, {
      method: 'POST',
      headers: await fleetAuthAPIHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
    }

    return response.json();
  };

  return renewFleetSecret;
};
