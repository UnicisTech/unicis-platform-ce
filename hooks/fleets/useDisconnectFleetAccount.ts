import { defaultHeaders } from "@/lib/common";

export const useDisconnectFleetAccount = () => {
  const disconnectFleetAccount = async (userId: string, fleetId: string) => {
    try {
      const Presponse = await fetch('/api/fleet/connect', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ userId, fleetId, accessPhrase: '', connected: false }),
      });

      return Presponse.ok;
    } catch (err) {
      console.error('Error disconnecting fleet:', err);
      return false;
    }
  };

  return disconnectFleetAccount;
};
