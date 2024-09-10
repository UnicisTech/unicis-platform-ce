import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteQuery = () => {
  const deleteQuery = async (fleetTeamId: string, queryId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/query/${queryId}/delete`, {
        method: 'DELETE',
        headers: fleetAuthAPIHeaders(accessPhrase!),
      });

      if (!response.ok) {
        const errorData = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting query:', error);
      throw error;
    }
  };

  return deleteQuery;
};