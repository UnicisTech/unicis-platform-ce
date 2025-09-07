import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { TagsWithRelationships } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetTagId = (teamId: string, tagId: string) => {
  const [tag, setTag] = useState<TagsWithRelationships>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTag = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/tag/${tagId}`, {
          method: 'GET',
          headers: await fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: TagsWithRelationships = await response.json();
        setTag(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [teamId, tagId]);

  return { tag, isLoading, isError };
};