import Cookies from 'js-cookie';

export const fleetAccessTokenCookieName = 'unicis-fleet-access-token';

export const legacyFleetAccessTokenCookieName = 'unicis-fleet-access-token';

export const fleetAccessTokenCookieOptions = {
  sameSite: 'strict',
} as const;

export const fleetAuthExpiredEventName = 'unicis:fleet-auth-expired';

export const clearFleetAccessToken = () => {
  Cookies.remove(fleetAccessTokenCookieName);
  Cookies.remove(legacyFleetAccessTokenCookieName);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(fleetAuthExpiredEventName));
  }
};

export const getFleetAccessTokenFromCookieStore = (
  cookies: Partial<Record<string, string>>
) =>
  cookies[fleetAccessTokenCookieName] ??
  cookies[legacyFleetAccessTokenCookieName];
