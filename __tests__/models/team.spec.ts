import { createMockReq, createMockRes } from '../helpers/mockReqRes';
import { TextDecoder, TextEncoder } from 'util';

jest.mock('lib/prisma', () => ({
  prisma: {
    team: {
      findUniqueOrThrow: jest.fn(),
    },
  },
}));

jest.mock('lib/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('lib/api-key-auth', () => ({
  verifyApiKey: jest.fn(),
}));

jest.mock('lib/svix', () => ({
  findOrCreateApp: jest.fn(),
}));

jest.mock('lib/matomo/server', () => ({
  trackServerEvent: jest.fn(),
}));

jest.mock('models/subscription', () => ({
  addSubscription: jest.fn(),
}));

import { prisma } from 'lib/prisma';
import { getSession } from 'lib/session';
import { verifyApiKey } from 'lib/api-key-auth';

const prismaMock = prisma as unknown as {
  team: {
    findUniqueOrThrow: jest.Mock;
  };
  teamMember: {
    findFirstOrThrow: jest.Mock;
  };
};

let throwIfNoTeamAccess: typeof import('models/team').throwIfNoTeamAccess;

describe('throwIfNoTeamAccess', () => {
  beforeAll(async () => {
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
    ({ throwIfNoTeamAccess } = await import('models/team'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates Bearer API keys without requiring a session cookie', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const team = {
      id: 'team-1',
      slug: 'test-team',
      name: 'Test Team',
      subscription: null,
    };
    const admin = {
      id: 'member-1',
      teamId: 'team-1',
      userId: 'user-1',
      createdAt,
      updatedAt,
      user: {
        id: 'user-1',
        name: 'API Admin',
        email: 'admin@example.com',
      },
    };

    (verifyApiKey as jest.Mock).mockResolvedValue({
      apiKey: { id: 'api-key-1', teamId: 'team-1' },
      admin,
    });
    prismaMock.team.findUniqueOrThrow.mockResolvedValue(team);

    const req = createMockReq({
      query: { slug: 'test-team' },
      headers: { authorization: 'Bearer test-api-key' },
    });
    const res = createMockRes();

    const teamMember = await throwIfNoTeamAccess(req, res);

    expect(verifyApiKey).toHaveBeenCalledWith('test-api-key', 'test-team');
    expect(prismaMock.team.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'team-1' },
      include: { subscription: true },
    });
    expect(getSession).not.toHaveBeenCalled();
    expect(teamMember).toMatchObject({
      id: 'member-1',
      teamId: 'team-1',
      userId: 'user-1',
      role: 'ADMIN',
      team,
      user: {
        id: 'user-1',
        name: 'API Admin',
        email: 'admin@example.com',
        roles: [{ teamId: 'team-1', role: 'ADMIN' }],
      },
    });
  });

  it('uses session auth without checking API keys when no Bearer token is present', async () => {
    const sessionUser = {
      id: 'user-2',
      name: 'Session User',
      email: 'session@example.com',
    };
    const teamMemberFromSession = {
      id: 'member-2',
      teamId: 'team-2',
      userId: 'user-2',
      role: 'MEMBER',
      team: {
        id: 'team-2',
        slug: 'session-team',
        name: 'Session Team',
        subscription: null,
      },
    };

    (getSession as jest.Mock).mockResolvedValue({ user: sessionUser });
    prismaMock.teamMember = {
      findFirstOrThrow: jest.fn().mockResolvedValue(teamMemberFromSession),
    };

    const req = createMockReq({
      query: { slug: 'session-team' },
      headers: {},
    });
    const res = createMockRes();

    const teamMember = await throwIfNoTeamAccess(req, res);

    expect(verifyApiKey).not.toHaveBeenCalled();
    expect(getSession).toHaveBeenCalledWith(req, res);
    expect(teamMember).toMatchObject({
      ...teamMemberFromSession,
      user: sessionUser,
    });
  });
});
