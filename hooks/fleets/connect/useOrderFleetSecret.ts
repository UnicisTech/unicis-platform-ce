import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useOrderFleetSecret = () => {
  const orderFleetSecret = async (fleetTeamId: string) => {
    const response = await fleetV1(`/fleet/teams/${fleetTeamId}/secret`, {
      method: 'POST',
      headers: fleetAuthAPIHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
    }

    return response.json();
  };

  return orderFleetSecret;
};
