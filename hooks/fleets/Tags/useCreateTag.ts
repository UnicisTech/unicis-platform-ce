import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useCreateTag = () => {
  const createTag = async (fleetTeamId: string, data, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/tag/add`, {
        method: 'POST',
        headers: fleetAuthAPIHeaders(accessPhrase!),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  return createTag;
};