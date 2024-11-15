import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteAssetLog = () => {
  const deleteAssetLog = async (fleetTeamId: string, nodeId: string, logId: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/node/${nodeId}/delete/log/${logId}`, {
        method: 'DELETE',
        headers: fleetAuthAPIHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting node log:', error);
    }
  };

  return deleteAssetLog;
};