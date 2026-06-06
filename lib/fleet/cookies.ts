export const fleetAccessTokenCookieName = 'unicis-fleet-access-token';

export const legacyFleetAccessTokenCookieName =
  'unicis-fleet-access-token';

export const fleetAccessTokenCookieOptions = {
  sameSite: 'strict',
} as const;

export const getFleetAccessTokenFromCookieStore = (
  cookies: Partial<Record<string, string>>
) =>
  cookies[fleetAccessTokenCookieName] ??
  cookies[legacyFleetAccessTokenCookieName];
