import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useUpdateTag = () => {
  const updateTag = async (fleetTeamId: string, data, tagID) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/tag/${tagID}/update`, {
        method: 'PUT',
        headers: fleetAuthAPIHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const data = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error', error);
    }
  };

  return updateTag;
};