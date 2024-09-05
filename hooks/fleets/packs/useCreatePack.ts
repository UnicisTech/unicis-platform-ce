import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useCreatePack = () => {
  const createPack = async (fleetTeamId: string, data, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/packs/add`, {
        method: 'POST',
        headers: fleetAuthAPIHeaders(accessPhrase!),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while creating the pack.');
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error creating pack:', error);
      throw error;
    }
  };

  return createPack;
};