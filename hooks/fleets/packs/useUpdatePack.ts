import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useUpdatePack = () => {
  const updatePack = async (fleetTeamId: string, data, packId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/pack/${packId}/update`, {
        method: 'PUT',
        headers: fleetAuthAPIHeaders(accessPhrase!),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while updating the pack.');
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error updating pack:', error);
      throw error;
    }
  };

  return updatePack;
};