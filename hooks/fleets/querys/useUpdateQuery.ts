import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useUpdateQuery = () => {
  const updateQuery = async (fleetTeamId: string, data, queryId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/query/${queryId}/update`, {
        method: 'PUT',
        headers: fleetAuthAPIHeaders(accessPhrase!),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error updating query:', error);
      throw error;
    }
  };

  return updateQuery;
};