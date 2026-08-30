/** @jest-environment node */

import { platformFleet } from '@/lib/fleet/apiBase';
import { createFleetPlatformMockHandler } from '@/lib/fleet/mock/handler';

describe('Fleet platform transport', () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFleetMode = process.env.NEXT_PUBLIC_FLEET_MODE;
  const originalScenario = process.env.NEXT_PUBLIC_FLEET_MOCK_SCENARIO;
  const originalFetch = global.fetch;

  afterEach(() => {
    mutableEnv.NODE_ENV = originalNodeEnv;
    mutableEnv.NEXT_PUBLIC_FLEET_MODE = originalFleetMode;
    mutableEnv.NEXT_PUBLIC_FLEET_MOCK_SCENARIO = originalScenario;
    global.fetch = originalFetch;
  });

  it('uses the platform mock without fetch only in development', async () => {
    mutableEnv.NODE_ENV = 'development';
    mutableEnv.NEXT_PUBLIC_FLEET_MODE = 'mock';
    mutableEnv.NEXT_PUBLIC_FLEET_MOCK_SCENARIO = 'default';
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    const response = await platformFleet('/api/fleet/access/verify', {
      method: 'GET',
    });
    const access = await response.json();

    expect(access.is_active).toBe(true);
    expect(access.is_expired).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cannot select the mock transport in production', async () => {
    mutableEnv.NODE_ENV = 'production';
    mutableEnv.NEXT_PUBLIC_FLEET_MODE = 'mock';
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ exists: true }), { status: 200 })
      );
    global.fetch = fetchMock;

    const response = await platformFleet('/api/fleet/check-account', {
      method: 'GET',
    });

    await expect(response.json()).resolves.toEqual({ exists: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/fleet/check-account', {
      method: 'GET',
    });
  });

  it('keeps secret deletion and bootstrap in memory for one mock session', async () => {
    const handler = createFleetPlatformMockHandler('default');
    const endpoint = '/api/fleet/secret?teamId=platform-test-team';

    const initial = await handler(endpoint);
    expect((await initial.json()).secret).toContain('NOT_REAL');

    await handler(endpoint, { method: 'DELETE' });
    expect((await handler(endpoint)).status).toBe(404);

    const bootstrap = await handler('/api/fleet/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ teamId: 'platform-test-team' }),
    });
    expect((await bootstrap.json()).fleetToken).toContain('NOT_REAL');
    expect((await handler(endpoint)).status).toBe(200);
  });

  it('models an unconfigured Fleet until bootstrap completes', async () => {
    const handler = createFleetPlatformMockHandler('unconfigured');
    const secretEndpoint =
      '/api/fleet/secret?teamId=platform-unconfigured-team';

    const initialAccess = await handler('/api/fleet/access/verify');
    const initialSecret = await handler(secretEndpoint);
    const initialAccount = await handler('/api/fleet/check-account');

    expect(initialAccess.status).toBe(401);
    expect(initialSecret.status).toBe(404);
    await expect(initialAccount.json()).resolves.toEqual({ exists: false });

    const bootstrap = await handler('/api/fleet/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ teamId: 'platform-unconfigured-team' }),
    });
    const bootstrapResult = await bootstrap.json();

    expect(bootstrapResult.fleetToken).toContain('NOT_REAL');

    const configuredAccess = await handler('/api/fleet/access/verify');
    const configuredSecret = await handler(secretEndpoint);
    const configuredAccount = await handler('/api/fleet/check-account');

    expect(configuredAccess.status).toBe(200);
    await expect(configuredAccess.json()).resolves.toEqual(
      expect.objectContaining({ is_active: true, is_expired: false })
    );
    expect(configuredSecret.status).toBe(200);
    await expect(configuredAccount.json()).resolves.toEqual({ exists: true });
  });

  it('fails clearly for unknown platform endpoints without fallback', async () => {
    const handler = createFleetPlatformMockHandler('default');

    await expect(handler('/api/fleet/not-implemented')).rejects.toThrow(
      'Fleet platform mock has no handler for GET /api/fleet/not-implemented'
    );
  });
});
