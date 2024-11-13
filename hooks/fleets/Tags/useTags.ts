import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { TagsResponse, Tag } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useTags = (teamId: string) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/manager/${teamId}/tags`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: TagsResponse = await response.json();
        setTags(data.tags);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [teamId]);

  return { tags, isLoading, isError };
};