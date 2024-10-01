import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { Query, QuerysResponse } from "@/types/fleet";
import { useEffect, useState } from "react";


export const useDistributors = (teamId: string, body, accessPhrase: string) => {
  const [distributors, setDistributors] = useState<Query[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDistributors = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/add`, {
          method: 'POST',
          headers: fleetAuthAPIHeaders(accessPhrase!),
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: QuerysResponse = await response.json();
        setDistributors(data.queries);
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