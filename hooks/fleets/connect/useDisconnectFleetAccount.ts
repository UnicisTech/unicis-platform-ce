import { defaultHeaders } from "@/lib/common";

export const useDisconnectFleetAccount = () => {
  const disconnectFleetAccount = async (userId: string) => {
    try {
      const Presponse = await fetch('/api/fleet/connect', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ userId, fleetAccessPhrase: null }),
      });

      return Presponse.ok;
    } catch (err) {
      console.error('Error disconnecting fleet:', err);
      return false;
    }
  };

  return disconnectFleetAccount;
};
