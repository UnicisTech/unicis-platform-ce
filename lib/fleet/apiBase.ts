import env from '@/lib/env';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const getFleetErrorMessage = async (response: Response) => {
  const fallback = `HTTP error! status: ${response.status}`;

  try {
    const error = await response.clone().json();

    return (
      error?.error?.message ||
      error?.message ||
      error?.msg ||
      error?.info ||
      fallback
    );
  } catch {
    try {
      return (await response.clone().text()) || fallback;
    } catch {
      return fallback;
    }
  }
};

const normalizeFleetBase = () => {
  const fleetApiUrl = env.fleetAPIUrl?.trim();
  const fleetApiHost = env.fleetAPI?.trim();

  if (fleetApiUrl && fleetApiUrl !== 'undefined') {
    return fleetApiUrl.replace(/\/+$/, '');
  }

  if (fleetApiHost && fleetApiHost !== 'undefined') {
    const base = /^https?:\/\//.test(fleetApiHost)
      ? fleetApiHost
      : `https://${fleetApiHost}`;

    return base.replace(/\/+$/, '');
  }

  throw new Error('Fleet API base URL is not configured');
};

export const fleetV1 = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${normalizeFleetBase()}/api/v1${endpoint}`;

  console.log('[fleetV1] Request:', {
    url,
    headers: options?.headers,
    method: options?.method || 'GET',
  });

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  console.log('[fleetV1] Response:', {
    url,
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    throw new Error(await getFleetErrorMessage(response));
  }

  return response;
};

export const fleetV2 = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const response = await fetch(`${normalizeFleetBase()}/api/v2${endpoint}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getFleetErrorMessage(response));
  }

  return response;
};
