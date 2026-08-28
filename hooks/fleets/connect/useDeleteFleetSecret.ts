import { platformFleet } from '@/lib/fleet/apiBase';

export const useDeleteFleetSecret = () => {
  const deleteSecret = async (teamId: string) => {
    const response = await platformFleet(
      `/api/fleet/secret?teamId=${encodeURIComponent(teamId)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.json().catch(() => ({}));
  };

  return deleteSecret;
};
