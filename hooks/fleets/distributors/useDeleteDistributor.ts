import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";
import { useEffect, useState } from "react";

export const useDeleteDistributed = () => {
  const deleteDistributor = async (teamId: string, distributorId: string,  accessPhrase?: string) => {
      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/delete/${distributorId}`, {
          method: 'DELETE',
          headers: fleetAuthAPIHeaders(accessPhrase!),
        });

        if (!response.ok) {
          const data = await response.json();
        }

      } catch (err) {
      }
  };
  
  return deleteDistributor;
};