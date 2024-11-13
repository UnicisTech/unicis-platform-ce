import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { NodesResponse, Node } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useNodes = (teamId: string, status?: string) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (!status || status === 'all') {
          // Fetch all nodes if status is 'all' or undefined
          response = await fleetV1(`/manager/${teamId}/nodes`, {
            method: 'GET',
            headers: fleetAuthAPIHeaders(),
          });
        } else if (status === 'active' || status === 'inactive') {
          // Fetch nodes based on status ('active' or 'inactive')
          response = await fleetV1(`/manager/${teamId}/nodes/${status}`, {
            method: 'GET',
            headers: fleetAuthAPIHeaders(),
          });
        }

        if (!response || !response.ok) {
          const data = await response.json();
        }

        const data: NodesResponse = await response.json();
        setNodes(data.nodes);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [teamId, status]);

  return { nodes, isLoading, isError };
};