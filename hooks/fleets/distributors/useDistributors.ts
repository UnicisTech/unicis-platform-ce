import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { DistributedQueryTaskResponse, DistributedQueryTask } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useDistributors = (teamId: string) => {
  const [tasks, setDistributorsTasks] = useState<DistributedQueryTask[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDistributors = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: DistributedQueryTaskResponse = await response.json();
        setDistributorsTasks(data.tasks);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributors();
  }, [teamId]);

  return { tasks, isLoading, isError };
};