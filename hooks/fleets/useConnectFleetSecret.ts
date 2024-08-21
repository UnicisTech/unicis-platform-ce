import { defaultHeaders } from "@/lib/common";

export const useConnectFleetSecret = () => {
  const connectFleetSecret = async (teamId: string, fleetTeamId: string, secret: string) => {
    const response = await fetch('/api/fleet/secret', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        teamId,
        fleetTeamId,
        secret,
        active: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect fleet');
    }

    return response.json();
  };

  return connectFleetSecret;
};
