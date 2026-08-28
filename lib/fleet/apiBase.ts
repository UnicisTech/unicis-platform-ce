import env from '@/lib/env';
import { isFleetMockEnabled } from './mock/config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export type FleetApiError = Error & { status?: number };

const getFleetErrorMessage = async (response: Response) => {
  const fallback = `HTTP error! status: ${response.status}`;

  try {
    const error = await response.clone().json();

    return (
      (typeof error?.error === 'string'
        ? error.error
        : error?.error?.message) ||
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

const assertFleetResponse = async (response: Response) => {
  if (response.ok) return;

  throw Object.assign(new Error(await getFleetErrorMessage(response)), {
    name: 'FleetApiError',
    status: response.status,
  });
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

const fleetRequest = async (
  version: 'v1' | 'v2',
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  if (isFleetMockEnabled()) {
    const { handleFleetMockRequest } = await import('./mock/handler');
    const response = await handleFleetMockRequest(version, endpoint, options);

    await assertFleetResponse(response);
    return response;
  }

  const url = `${normalizeFleetBase()}/api/${version}${endpoint}`;

  console.log(`[fleet${version.toUpperCase()}] Request:`, {
    url,
    headers: options?.headers,
    method: options?.method || 'GET',
  });

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  console.log(`[fleet${version.toUpperCase()}] Response:`, {
    url,
    status: response.status,
    ok: response.ok,
  });

  await assertFleetResponse(response);
  return response;
};

export const fleetV1 = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => fleetRequest('v1', endpoint, options);

export const fleetV2 = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => fleetRequest('v2', endpoint, options);

export const platformFleet = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  if (!/^\/api\/fleet(?:\/|$)/.test(endpoint)) {
    throw new Error(
      `platformFleet only accepts /api/fleet endpoints: ${endpoint}`
    );
  }

  const response = isFleetMockEnabled()
    ? await import('./mock/handler').then(
        ({ handleFleetPlatformMockRequest }) =>
          handleFleetPlatformMockRequest(endpoint, options)
      )
    : await fetch(endpoint, options);

  await assertFleetResponse(response);
  return response;
};
