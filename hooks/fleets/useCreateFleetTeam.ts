import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { FleetTeamResponse } from "@/types";

import { useCallback } from 'react';

export const useCreateFleetTeam = () => {
  const createFleetTeam = useCallback(async (name: string, accessPhrase: string): Promise<FleetTeamResponse> => {
    const response = await fleetV1(`/team/create`, {
      method: 'POST',
      headers: fleetAuthAPIHeaders(accessPhrase),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error creating fleet team');
    }

    return response.json();
  }, []);

  return createFleetTeam;
};
