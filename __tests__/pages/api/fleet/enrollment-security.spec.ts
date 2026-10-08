import completeEnrollment from '../../../../pages/api/fleet/enroll/complete';
import enroll from '../../../../pages/api/fleet/enroll';
import { createMockReq, createMockRes } from '../../../helpers/mockReqRes';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/session';

jest.mock('../../../../lib/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    team: { findFirst: jest.fn() },
    teamMember: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    fleetEnrollment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('../../../../lib/email/sendFleetEnrollEmail', () => ({
  sendFleetEnrollEmail: jest.fn(),
}));

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock };
  team: { findFirst: jest.Mock };
  teamMember: { findFirst: jest.Mock; findUnique: jest.Mock };
  fleetEnrollment: {
    findUnique: jest.Mock;
    update: jest.Mock;
    upsert: jest.Mock;
  };
};

const pendingEnrollment = {
  id: 'enrollment-1',
  teamId: 'team-1',
  status: 'PENDING',
  expiresAt: new Date(Date.now() + 60_000),
  user: {
    id: 'user-2',
    email: 'member@example.com',
  },
};

describe('Fleet enrollment authorization', () => {
  const originalFleetApiUrl = process.env.FLEET_API_URL;
  const originalFleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FLEET_API_URL = 'https://fleet.example.com';
    process.env.FLEET_SERVICE_TOKEN = 'service-token';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.FLEET_API_URL = originalFleetApiUrl;
    process.env.FLEET_SERVICE_TOKEN = originalFleetServiceToken;
  });

  it('rejects enrollment without a platform session before calling Fleet', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({
      method: 'POST',
      body: { email: 'member@example.com', teamId: 'team-1' },
    });
    const res = createMockRes();

    await enroll(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects enrollment when the requester is not a team admin', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'member@example.com',
      name: 'Team Member',
    });
    mockedPrisma.team.findFirst.mockResolvedValue({
      id: 'team-1',
      name: 'Team',
      slug: 'team',
    });
    mockedPrisma.teamMember.findFirst.mockResolvedValue(null);
    const req = createMockReq({
      method: 'POST',
      body: { email: 'member@example.com', teamId: 'team-1' },
    });
    const res = createMockRes();

    await enroll(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects direct completion without a platform session', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({
      method: 'POST',
      body: {
        email: 'member@example.com',
        teamId: 'team-1',
        fleetPassword: 'password',
      },
    });
    const res = createMockRes();

    await completeEnrollment(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockedPrisma.fleetEnrollment.update).not.toHaveBeenCalled();
  });

  it('rejects an expired enrollment token', async () => {
    mockedPrisma.fleetEnrollment.findUnique.mockResolvedValue({
      ...pendingEnrollment,
      expiresAt: new Date(Date.now() - 60_000),
    });
    const req = createMockReq({
      method: 'POST',
      body: { token: 'expired-token', fleetPassword: 'password' },
    });
    const res = createMockRes();

    await completeEnrollment(req, res);

    expect(res._getStatusCode()).toBe(410);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockedPrisma.fleetEnrollment.update).not.toHaveBeenCalled();
  });

  it('does not complete enrollment when Fleet rejects the password', async () => {
    mockedPrisma.fleetEnrollment.findUnique.mockResolvedValue(
      pendingEnrollment
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });
    const req = createMockReq({
      method: 'POST',
      body: { token: 'valid-token', fleetPassword: 'wrong-password' },
    });
    const res = createMockRes();

    await completeEnrollment(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockedPrisma.fleetEnrollment.update).not.toHaveBeenCalled();
  });

  it('completes enrollment only after Fleet accepts the password', async () => {
    mockedPrisma.fleetEnrollment.findUnique.mockResolvedValue(
      pendingEnrollment
    );
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          is_temporary_password: false,
          fleet_access: { secret_key: 'fleet-token' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const req = createMockReq({
      method: 'POST',
      body: { token: 'valid-token', fleetPassword: 'valid-password' },
    });
    const res = createMockRes();

    await completeEnrollment(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockedPrisma.fleetEnrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-1' },
      data: { status: 'COMPLETED' },
    });
  });
});
