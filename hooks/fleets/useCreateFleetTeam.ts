import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useCreateFleetTeam = () => {
  const createFleetTeam = async (name: string, accessPhrase: string) => {
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
  };

  return createFleetTeam;
};
