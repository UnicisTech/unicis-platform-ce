import handler from '../../../../pages/api/oauth/authorize';
import jackson from '../../../../lib/jackson';

jest.mock('../../../../lib/jackson', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const createMockRes = () => {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown;
  let redirectPayload: { code: number; url: string } | null = null;

  const res: any = {
    setHeader: (key: string, value: string) => {
      headers[key] = value;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (payload: unknown) => {
      body = payload;
      return res;
    },
    send: (payload: unknown) => {
      body = payload;
      return res;
    },
    redirect: (code: number, url: string) => {
      redirectPayload = { code, url };
      statusCode = code;
      return res;
    },
    _getHeaders: () => headers,
    _getStatusCode: () => statusCode,
    _getBody: () => body,
    _getRedirect: () => redirectPayload,
  };

  return res;
};

describe('/api/oauth/authorize', () => {
  const authorize = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (jackson as jest.Mock).mockResolvedValue({
      oauthController: {
        authorize,
      },
    });
  });

  it('redirects when oauth controller returns redirect_url', async () => {
    authorize.mockResolvedValue({
      redirect_url: 'https://example.com/callback?code=123',
    });

    const req: any = {
      method: 'GET',
      query: {
        client_id: 'client',
        redirect_uri: 'https://example.com/callback',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res._getRedirect()).toEqual({
      code: 302,
      url: 'https://example.com/callback?code=123',
    });
    expect(res._getStatusCode()).toBe(302);
  });

  it('sanitizes authorize_form and sets CSP headers for HTML response', async () => {
    authorize.mockResolvedValue({
      authorize_form:
        '<form onsubmit="alert(1)"><input onfocus=\'alert(1)\' /><a href="javascript:alert(1)">x</a><script>alert(1)</script></form>',
    });

    const req: any = {
      method: 'GET',
      query: {
        client_id: 'client',
        redirect_uri: 'https://example.com/callback',
      },
    };
    const res = createMockRes();

    await handler(req, res);

    const headers = res._getHeaders();
    const html = String(res._getBody());

    expect(headers['Content-Type']).toBe('text/html; charset=utf-8');
    expect(headers['Content-Security-Policy']).toContain("script-src 'none'");
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/\son\w+=/i);
    expect(html).not.toMatch(/javascript:/i);
  });
});
