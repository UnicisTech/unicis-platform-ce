import { defaultHeaders } from '@/lib/common';
import { fleetV1 } from '@/lib/fleet/apiBase';

export const useCreateFleetAccount = () => {
  const createFleetAccount = async (
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    try {
      await fleetV1(`/account/create`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          id,
          email,
          firstname: firstName,
          lastname: lastName,
          password,
        }),
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error creating fleet account:', err.message);
      } else {
        console.error('Error creating fleet account:', err);
      }
    }
  };

  return createFleetAccount;
};
