import { $Enums } from '@prisma/client';
import useTeam from './useTeam';

const useHasPlan = (slug: string) => {
  const { team } = useTeam(slug);

  const hasPlan = async (plan: $Enums.Plan): Promise<boolean> => {
    if (!team?.id) {
      console.error("Team ID is not available");
      return false;
    }

    try {
      const response = await fetch("/api/has-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, plan }),
      });

      if (!response.ok) {
        console.error("Failed to fetch plan:", await response.text());
        return false;
      }

      const data = await response.json();
      console.log(data);
      return data.hasPlan;
    } catch (error) {
      console.error("Error fetching plan:", error);
      return false;
    }
  };

  return {
    hasPlan,
  };
};


export default useHasPlan;
