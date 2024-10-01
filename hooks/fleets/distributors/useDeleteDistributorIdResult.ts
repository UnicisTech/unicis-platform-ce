import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { Query } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetDistributedIdResult = (teamId: string, distributorId: string, resultId: string,  accessPhrase?: string) => {
  const [distributorsResult, setDistributorsResult] = useState<Query>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributorResult = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/${distributorId}/results/delete/${resultId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: Query = await response.json();
        setDistributorsResult(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributorResult();
  }, [teamId, distributorId, accessPhrase]);

  return { distributorsResult, isLoading, isError };
};