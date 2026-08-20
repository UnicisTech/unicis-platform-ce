import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useCreateQuery = () => {
  const createQuery = async (fleetTeamId: string, data) => {
    const response = await fleetV1(`/manager/${fleetTeamId}/query/add`, {
      method: 'POST',
      headers: await fleetAuthAPIHeaders(),
      body: JSON.stringify(data),
    });

    return response.json();
  };

  return createQuery;
};
