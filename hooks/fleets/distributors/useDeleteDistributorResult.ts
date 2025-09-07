"/<string:team_id>/queries/distributed/<string:distributed_id>/results/delete/<string:result_id>"

import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";

export const useDeleteDistributedResult = () => {
  const deleteDistributorResult = async (teamId: string, distributorId: string, resultId: string) => {
      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/${distributorId}/results/delete/${resultId}`, {
          method: 'DELETE',
          headers: await fleetAuthAPIHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
        }

      } catch (err) {
      }
  };
  
  return deleteDistributorResult;
};