import { defaultHeaders } from "@/lib/common";

export const useConnectFleetSecret = () => {
  const connectFleetSecret = async (teamId: string, fleetTeamId: string, secret: string) => {
    const response = await fetch('/api/fleet/secret', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({
        teamId,
        fleetTeamId,
        secret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect fleet');
    }

    return response.json();
  };

  return connectFleetSecret;
};
