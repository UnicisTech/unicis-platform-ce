import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useDeleteDistributed = () => {
  const deleteDistributor = async (teamId: string, distributorId: string) => {
    try {
      const response = await fleetV1(
        `/manager/${teamId}/queries/distributed/delete/${distributorId}`,
        {
          method: 'DELETE',
          headers: await fleetAuthAPIHeaders(),
        }
      );

      if (!response.ok) {
        await response.json();
      }
    } catch {}
  };

  return deleteDistributor;
};
