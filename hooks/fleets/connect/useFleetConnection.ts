import useSWR, { mutate } from 'swr';

import { platformFleet } from '@/lib/fleet/apiBase';

export type FleetConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'DELETED';

export interface FleetConnection {
  status: FleetConnectionStatus;
  disconnectedAt: string | null;
  deleteAfter: string | null;
  deletedAt: string | null;
  cleanupError: string | null;
}

const getUrl = (teamId?: string) =>
  teamId ? `/api/fleet/connection?teamId=${encodeURIComponent(teamId)}` : null;

export const useFleetConnection = (teamId?: string) => {
  const url = getUrl(teamId);
  const { data, error, isLoading } = useSWR<FleetConnection>(
    url,
    async (endpoint: string) => {
      const response = await platformFleet(endpoint, { method: 'GET' });
      return response.json();
    },
    { shouldRetryOnError: false }
  );

  const disconnect = async () => {
    if (!teamId) return;

    await platformFleet('/api/fleet/connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, action: 'disconnect' }),
    });
    await mutate(getUrl(teamId));
  };

  const reconnect = async () => {
    if (!teamId) return;

    await platformFleet('/api/fleet/connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, action: 'reconnect' }),
    });
    await mutate(getUrl(teamId));
  };

  const mutateFleetConnection = async () => {
    if (!teamId) return;

    await mutate(getUrl(teamId));
  };

  return {
    connection: data,
    isDisconnected: data?.status === 'DISCONNECTED',
    isDeleted: data?.status === 'DELETED',
    isLoading,
    isError: !!error,
    disconnect,
    reconnect,
    mutateFleetConnection,
  };
};
