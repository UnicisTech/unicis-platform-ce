import { $Enums } from '@prisma/client';
import useTeam from './useTeam';
import { useState } from 'react';

const useHasPlan = (slug: string) => {
  const { team } = useTeam(slug);
  const [checkedHasPlan, setCheckedHasPlan] = useState<boolean>();

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
      setCheckedHasPlan(data.hasPlan);
      return data.hasPlan;
    } catch (error) {
      console.error("Error fetching plan:", error);
      return false;
    }
  };

  return {
    hasPlan,
    checkedHasPlan
  };
};


export default useHasPlan;
