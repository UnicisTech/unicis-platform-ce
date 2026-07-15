export const useDeleteFleetSecret = () => {
  const deleteSecret = async (teamId: string) => {
    const response = await fetch(
      `/api/fleet/secret?teamId=${encodeURIComponent(teamId)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || 'Failed to delete Fleet secret');
    }

    return response.json().catch(() => ({}));
  };

  return deleteSecret;
};
