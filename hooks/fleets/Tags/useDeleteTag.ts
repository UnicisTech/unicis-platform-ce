import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteTag = () => {
  const deleteTag = async (fleetTeamId: string, tagId: string, accessPhrase?: string) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/tag/${tagId}/delete`, {
        method: 'DELETE',
        headers: fleetAuthAPIHeaders(accessPhrase!),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while deleting the tag.');
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting tag:', error);
      throw error;
    }
  };

  return deleteTag;
};