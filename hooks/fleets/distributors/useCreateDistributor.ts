import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useCreateDistributors = () => {
  const createDistributor = async (teamId: string, body) => {
    try {
      const response = await fleetV1(
        `/manager/${teamId}/queries/distributed/add`,
        {
          method: 'POST',
          headers: await fleetAuthAPIHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        await response.json();
      }

      return response.json();
    } catch (error) {
      // Optional: Handle or log the error more specifically here if needed
      console.error('Error creating distributor:', error);
    }
  };

  return createDistributor;
};
