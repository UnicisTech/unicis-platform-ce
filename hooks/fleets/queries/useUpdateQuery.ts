import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useUpdateQuery = () => {
  const updateQuery = async (fleetTeamId: string, data, queryId: string) => {
    const response = await fleetV1(
      `/manager/${fleetTeamId}/query/${queryId}/update`,
      {
        method: 'PUT',
        headers: await fleetAuthAPIHeaders(),
        body: JSON.stringify(data),
      }
    );

    return response.json();
  };

  return updateQuery;
};
