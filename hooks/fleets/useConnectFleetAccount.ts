import { defaultHeaders } from "@/lib/common";

export const useConnectFleetAccount = () => {
  const connectFleetAccount = async (userId: string, fleetId: string, secret: string) => {
    try {
      const Presponse = await fetch('/api/fleet/connect', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ userId, fleetId, accessPhrase: secret, connected: true }),
      });

      return Presponse.ok;
    } catch (err) {
      console.error('Error connecting fleet:', err);
      return false;
    }
  };

  return connectFleetAccount;
};
