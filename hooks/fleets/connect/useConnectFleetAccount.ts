import { defaultHeaders } from "@/lib/common";

export const useConnectFleetAccount = () => {
  const connectFleetAccount = async (userId: string, fleetId: string, fleetAccessPhrase: string) => {
    try {
      const Presponse = await fetch('/api/fleet/connect', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ userId, fleetId, fleetAccessPhrase }),
      });

      return Presponse.ok;
    } catch (err) {
      console.error('Error connecting fleet:', err);
      return false;
    }
  };

  return connectFleetAccount;
};
