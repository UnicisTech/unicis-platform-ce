import { FleetSecret } from '@prisma/client';
import { defaultHeaders } from '@/lib/common';

export const getFleetSecret = async (teamId: string) => {

  const response = await fetch(`/api/fleet/secret?teamId=${teamId}`, {
    method: 'GET',
    headers: defaultHeaders
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect fleet');
  }

  const json = await response.json() as Partial<FleetSecret>;
  return json;
  
};
  