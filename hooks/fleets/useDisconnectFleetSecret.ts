import { defaultHeaders } from "@/lib/common";

export const useDisconnectFleetSecret = () => {
  const disconnectFleetSecret = async (teamId: string, fleetTeamId: string) => {
    const response = await fetch('/api/fleet/secret', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        teamId,
        fleetTeamId,
        secret: '',
        active: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect fleet');
    }

    return response.json();
  };

  return disconnectFleetSecret;
};
