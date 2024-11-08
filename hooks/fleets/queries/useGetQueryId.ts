import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { Query } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetQueryId = (teamId: string, queryId: string,  accessPhrase?: string) => {
  const [query, setQuery] = useState<Query>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuery = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/query/${queryId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: Query = await response.json();
        setQuery(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuery();
  }, [teamId, queryId, accessPhrase]);

  return { query, isLoading, isError };
};