import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useDeleteTag = () => {
  const deleteTag = async (fleetTeamId: string, tagId: string) => {
    try {
      const response = await fleetV1(
        `/manager/${fleetTeamId}/tag/${tagId}/delete`,
        {
          method: 'DELETE',
          headers: await fleetAuthAPIHeaders(),
        }
      );

      if (!response.ok) {
        await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error deleting tag:', error);
    }
  };

  return deleteTag;
};
