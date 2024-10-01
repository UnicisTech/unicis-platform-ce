import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { DistributedQueryResponse, DistributedQuery } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useDistributors = (teamId: string, accessPhrase: string) => {
  const [distributors, setDistributors] = useState<DistributedQuery[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDistributors = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: DistributedQueryResponse = await response.json();
        setDistributors(data.distributor);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributors();
  }, [teamId, accessPhrase]);

  return { distributors, isLoading, isError };
};