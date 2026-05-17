import env from "@/lib/env";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const fleetV1 = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = `${env.fleetAPIUrl}/api/v1${endpoint}`;

  console.log('[fleetV1] Request:', {
    url,
    headers: options?.headers,
    method: options?.method || 'GET'
  });

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  console.log('[fleetV1] Response:', {
    url,
    status: response.status,
    ok: response.ok
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
    credentials: 'include',
  });

  if (!response.ok) {
    // Handle HTTP errors here
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};
