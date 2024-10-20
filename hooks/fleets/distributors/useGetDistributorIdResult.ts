import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { DistributedQueryResult } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetDistributedIdResult = (teamId: string, distributorId: string, distributorStatus: 'new' | 'pending' | 'complete' | 'failed',  accessPhrase?: string) => {
  const [distributorsResult, setDistributorsResult] = useState<DistributedQueryResult>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributorResult = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/results/${distributorId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: DistributedQueryResult = await response.json();
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