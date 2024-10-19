import { fleetAuthAPIHeaders } from "@/lib/common";
import { fleetV1 } from "@/lib/fleet/apiBase";


export const useCreateDistributors = () => {
  const createDistributor = async (teamId: string, body, accessPhrase: string) => {
      try {
        const response = await fleetV1(`/manager/${teamId}/queries/distributed/add`, {
          method: 'POST',
          headers: fleetAuthAPIHeaders(accessPhrase!),
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json();
        }

        return response.json();
      } catch (error) {
        // Optional: Handle or log the error more specifically here if needed
        console.error('Error creating distributor:', error);
        throw error;
      }
    };

  return createDistributor;
};