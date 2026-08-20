import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useCreateDistributors = () => {
  const createDistributor = async (teamId: string, body) => {
    const response = await fleetV1(
      `/manager/${teamId}/queries/distributed/add`,
      {
        method: 'POST',
        headers: await fleetAuthAPIHeaders(),
        body: JSON.stringify(body),
      }
    );

    return response.json();
  };

  return createDistributor;
};
