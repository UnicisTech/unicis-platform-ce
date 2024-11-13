import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { FleetTeamResponse } from "@/types";

import { useCallback } from 'react';

export const useCreateFleetTeam = () => {
  const createFleetTeam = useCallback(async (name: string, id: string): Promise<FleetTeamResponse> => {
    const response = await fleetV1(`/team/create`, {
      method: 'POST',
      headers: fleetAuthAPIHeaders(),
      body: JSON.stringify({ name, id }),
    });

    if (!response.ok) {
      const data = await response.json();
    }

    return response.json();
  }, []);

  return createFleetTeam;
};
