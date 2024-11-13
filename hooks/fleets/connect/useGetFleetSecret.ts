import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { FleetSecret } from "@/types/fleet";
import { useEffect, useState } from "react";

export const useGetFleetSecret = (teamId: string) => {
  const [secret, setSecret] = useState<FleetSecret>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecret = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fleetV1(`/fleet/teams/${teamId}/secret`, {
          method: 'GET',
          headers: fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        const data: FleetSecret = await response.json();
        setSecret(data);
      } catch (err) {
        setError('An unexpecte derror occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecret();
  }, [teamId]);

  return { secret, isLoading, isError };
};