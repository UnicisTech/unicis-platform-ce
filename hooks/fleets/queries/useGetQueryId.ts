import { fleetAuthAPIHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';
import { Query } from '@/types/fleet';
import { useEffect, useState } from 'react';

export const useGetQueryId = (teamId: string, queryId: string) => {
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
          headers: await fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          await response.json();
        }

        const data: Query = await response.json();
        setQuery(data);
      } catch {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuery();
  }, [teamId, queryId]);

  return { query, isLoading, isError };
};
