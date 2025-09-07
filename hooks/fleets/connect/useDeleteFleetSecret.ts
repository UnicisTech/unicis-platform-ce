import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteFleetSecret = () => {
  const deleteSecret = async (teamId: string) => {
    try {
      const response = await fleetV1(`/fleet/teams/${teamId}/secret`, {
        method: 'DELETE',
        headers: await fleetAuthAPIHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
      }
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting secret:', error);
    }
  };

  return deleteSecret;
};