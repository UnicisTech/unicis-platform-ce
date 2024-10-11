import env from "@/lib/env";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const fleetV1 = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(`${env.fleetAPIUrl}/api/v1${endpoint}`, {
    ...options,
    mode: 'cors'
  });

  if (!response.ok) {
    // Handle HTTP errors here
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

export const fleetV2 = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(`${env.fleetAPIUrl}/api/v2${endpoint}`, {
    ...options,
    mode: 'cors'
  });

  if (!response.ok) {
    // Handle HTTP errors here
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};
