import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { NodesResponse, Node } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useNodes = (teamId: string, accessPhrase: string, status?: string) => {
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
            headers: fleetAuthAPIHeaders(accessPhrase!),
          });
        } else if (status === 'active' || status === 'inactive') {
          // Fetch nodes based on status ('active' or 'inactive')
          response = await fleetV1(`/manager/${teamId}/nodes/${status}`, {
            method: 'GET',
            headers: fleetAuthAPIHeaders(accessPhrase!),
          });
        }

        if (!response || !response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error fetching nodes');
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
  }, [teamId, status, accessPhrase]);

  return { nodes, isLoading, isError };
};