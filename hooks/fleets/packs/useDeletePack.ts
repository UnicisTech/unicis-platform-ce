import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeletePack = () => {
  const deletePack = async (fleetTeamId: string, packId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/pack/${packId}/delete`, {
        method: 'DELETE',
        headers: fleetAuthAPIHeaders(accessPhrase!),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while deleting the pack.');
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting pack:', error);
      throw error;
    }
  };

  return deletePack;
};