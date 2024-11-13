import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { Query, QuerysResponse } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useQuerys = (teamId: string) => {
  const [querys, setQuerys] = useState<Query[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuerys = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: QuerysResponse = await response.json();
        setQuerys(data.queries);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuerys();
  }, [teamId]);

  return { querys, isLoading, isError };
};