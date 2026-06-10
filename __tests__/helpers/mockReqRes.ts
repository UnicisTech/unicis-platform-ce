import type { NextApiRequest, NextApiResponse } from 'next';

export const createMockRes = () => {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let body: unknown;

  const res: any = {
    setHeader: (key: string, value: string | string[]) => {
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
    _getStatusCode: () => statusCode,
    _getBody: () => body as any,
    _getHeaders: () => headers,
  };

  return res as NextApiResponse & {
    _getStatusCode: () => number;
    _getBody: () => any;
    _getHeaders: () => Record<string, string | string[]>;
  };
};

export const createMockReq = (
  overrides: Partial<NextApiRequest> = {}
): NextApiRequest =>
  ({
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    ...overrides,
  }) as NextApiRequest;

export const mockTeamMember = {
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  },
  team: {
    id: 'team-1',
    slug: 'test-team',
    name: 'Test Team',
  },
  teamId: 'team-1',
  role: 'OWNER',
};
