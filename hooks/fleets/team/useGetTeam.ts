import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { FleetTeam } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetTeam = (teamId: string, accessPhrase?: string) => {
  const [fleetTeam, setTeam] = useState<FleetTeam>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/team/${teamId}`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: FleetTeam = await response.json();
        setTeam(data);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, accessPhrase]);

  return { fleetTeam, isLoading, isError };
};