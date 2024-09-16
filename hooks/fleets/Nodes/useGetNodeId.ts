import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { NodeWithRelationships } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetNodeId = (teamId: string, nodeId: string,  accessPhrase?: string) => {
  const [node, setNode] = useState<NodeWithRelationships>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNode = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/node/${nodeId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: NodeWithRelationships = await response.json();
        setNode(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [teamId, nodeId, accessPhrase]);

  return { node, isLoading, isError };
};