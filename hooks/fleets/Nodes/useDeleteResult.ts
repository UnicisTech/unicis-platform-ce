import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteAssetResultLog = () => {
  const deleteAssetResultLog = async (fleetTeamId: string, nodeId: string, resultId: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/node/${nodeId}/delete/result/${resultId}`, {
        method: 'DELETE',
        headers: await fleetAuthAPIHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting asset result:', error);
    }
  };

  return deleteAssetResultLog;
};