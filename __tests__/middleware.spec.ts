/** @jest-environment node */
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

import middleware from '../middleware';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));

const originalInternalUrl = process.env.NEXT_INTERNAL_APP_URL;

const request = (pathname: string) =>
  new NextRequest(new URL(pathname, 'http://localhost:4002'), {
    headers: { cookie: 'next-auth.session-token=test-token' },
  });

describe('Middleware route authorization', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue(null);
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
    } as Response);
    process.env.NEXT_INTERNAL_APP_URL = 'http://127.0.0.1:4002';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalInternalUrl === undefined) {
      delete process.env.NEXT_INTERNAL_APP_URL;
    } else {
      process.env.NEXT_INTERNAL_APP_URL = originalInternalUrl;
    }
  });

  it.each([
    '/api/hello',
    '/api/health',
    '/api/auth',
    '/api/auth/session',
    '/api/oauth/token',
    '/api/scim/v2.0/Users',
    '/auth',
    '/auth/',
    '/auth/login',
    '/auth/reset-password/token',
    '/invitations/token',
    '/api/invitations/token',
    '/terms-condition',
  ])('allows the public route %s without a token', async (pathname) => {
    const response = await middleware(request(pathname));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(getToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    '/authentic',
    '/api/authentication/session',
    '/auth/.hidden',
    '/invitations/token/extra',
    '/invitations/.hidden',
    '/api/invitations/token/extra',
    '/terms-condition/extra',
    '/account/settings',
    '/teams/acme/asset',
    '/teams/acme/asset-management/packs',
    '/teams/acme/tasks',
  ])('requires a token for %s', async (pathname) => {
    const response = await middleware(request(pathname));
    const redirect = new URL(response.headers.get('location')!);

    expect(response.status).toBe(307);
    expect(redirect.pathname).toBe('/auth/login');
    expect(redirect.searchParams.has('callbackUrl')).toBe(true);
    expect(getToken).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    '/teams/acme/asset',
    '/teams/acme/asset/',
    '/teams/acme/asset/node',
    '/teams/acme/asset/node/details',
    '/teams/acme/asset-management',
    '/teams/acme/asset-management/packs',
  ])('checks the plan for the asset route %s', async (pathname) => {
    (getToken as jest.Mock).mockResolvedValue({ sub: 'user-1' });

    const response = await middleware(request(pathname));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'http://127.0.0.1:4002/api/check-plan'
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { cookie: 'next-auth.session-token=test-token' },
    });
  });

  it.each([
    '/teams/acme/assets/node',
    '/teams/acme/asset-manager/node',
    '/teams/acme/tasks',
    '/teams/acme/settings',
  ])('does not apply an asset plan check to %s', async (pathname) => {
    (getToken as jest.Mock).mockResolvedValue({ sub: 'user-1' });

    const response = await middleware(request(pathname));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([401, 403, 500])(
    'redirects to billing when the plan check returns %s',
    async (status) => {
      (getToken as jest.Mock).mockResolvedValue({ sub: 'user-1' });
      fetchMock.mockResolvedValue({ ok: false, status } as Response);

      const response = await middleware(request('/teams/acme/asset/node'));

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/teams/acme/billing'
      );
      expect(fetchMock.mock.calls[0][1].body).toBe(
        JSON.stringify({ slug: 'acme' })
      );
    }
  );

  it('redirects to billing when the plan check cannot be reached', async () => {
    (getToken as jest.Mock).mockResolvedValue({ sub: 'user-1' });
    fetchMock.mockRejectedValue(new Error('Connection failed'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await middleware(request('/teams/acme/asset/node'));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe(
      '/teams/acme/billing'
    );
  });
});
