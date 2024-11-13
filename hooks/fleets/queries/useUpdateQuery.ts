import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useUpdateQuery = () => {
  const updateQuery = async (fleetTeamId: string, data, queryId: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/query/${queryId}/update`, {
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
      console.error('Error updating query:', error);
    }
  };

  return updateQuery;
};