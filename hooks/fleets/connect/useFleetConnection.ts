import useSWR, { mutate } from 'swr';

export type FleetConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'DELETED';

export type FleetConnection = {
  status: FleetConnectionStatus;
  disconnectedAt: string | null;
  deleteAfter: string | null;
  deletedAt: string | null;
  cleanupError: string | null;
};

const getUrl = (teamId?: string) =>
  teamId ? `/api/fleet/connection?teamId=${encodeURIComponent(teamId)}` : null;

export const useFleetConnection = (teamId?: string) => {
  const url = getUrl(teamId);

  const { data, error, isLoading } = useSWR<FleetConnection>(
    url,
    async (fetchUrl: string) => {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Fleet connection status');
      }

      return response.json();
    },
    {
      shouldRetryOnError: false,
    }
  );

  const disconnect = async () => {
    if (!teamId) return;

    const response = await fetch('/api/fleet/connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, action: 'disconnect' }),
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect Fleet');
    }

    await mutate(getUrl(teamId));
  };

  const reconnect = async () => {
    if (!teamId) return;

    const response = await fetch('/api/fleet/connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, action: 'reconnect' }),
    });

    if (!response.ok) {
      throw new Error('Failed to reconnect Fleet');
    }

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
