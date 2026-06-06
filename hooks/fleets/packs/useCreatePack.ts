import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useCreatePack = () => {
  const createPack = async (fleetTeamId: string, data) => {
    try {
      const response = await fleetV1(`/manager/${fleetTeamId}/pack/add`, {
        method: 'POST',
        headers: await fleetAuthAPIHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error creating pack:', error);
    }
  };

  return createPack;
};
