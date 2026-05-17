import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useCreateQuery = () => {
  const createQuery = async (fleetTeamId: string, data) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/query/add`, {
        method: 'POST',
        headers: await fleetAuthAPIHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating query:', errorData);
        throw new Error(errorData.message || 'Failed to create query');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating query:', error);
      throw error;
    }
  };

  return createQuery;
};