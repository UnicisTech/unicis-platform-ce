import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { Pack, PacksResponse } from "@/types/fleet";
import { useEffect, useState } from "react";

export const usePacks = (teamId: string) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/packs`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: PacksResponse = await response.json();
        setPacks(data.packs);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, [teamId]);

  return { packs, isLoading, isError };
};