import { defaultHeaders } from "@/lib/common";

export const useDisconnectFleetSecret = () => {
  const disconnectFleetSecret = async (teamId: string) => {
    const response = await fetch('/api/fleet/secret', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({
        teamId,
        secret: null
      }),
    });

    if (!response.ok) {
      console.error('Failed to disconnect fleet');
    }

    return response.json();
  };

  return disconnectFleetSecret;
};
