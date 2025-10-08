import { getCookie } from 'cookies-next';
import env from '@/lib/env';
import type { GetServerSidePropsContext } from 'next';

const useSecureCookie = env.appUrl.startsWith('https://');

export const sessionTokenCookieName =
  (useSecureCookie ? '__Secure-' : '') + 'next-auth.session-token';

export const getParsedCookie = (
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res']
): {
  token: string | null;
  url: string | null;
} => {
  const cookie = getCookie('pending-invite', { req, res });

  return cookie
    ? JSON.parse(cookie as string)
    : {
        token: null,
        url: null,
      };
};
