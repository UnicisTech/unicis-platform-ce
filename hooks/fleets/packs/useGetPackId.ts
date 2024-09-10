import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { PackWithRelationships } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetPackId = (teamId: string, packId: string,  accessPhrase?: string) => {
  const [pack, setPack] = useState<PackWithRelationships>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPack = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/pack/${packId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error fetching packs');
        }

        const data: PackWithRelationships = await response.json();
        setPack(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [teamId, accessPhrase]);

  return { pack, isLoading, isError };
};