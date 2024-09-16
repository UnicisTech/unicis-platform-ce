import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteNode = () => {
  const deleteNode = async (fleetTeamId: string, nodeId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/node/${nodeId}/delete`, {
        method: 'DELETE',
        headers: fleetAuthAPIHeaders(accessPhrase!),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while deleting the node.');
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting node:', error);
      throw error;
    }
  };

  return deleteNode;
};