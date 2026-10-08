import checkPlan from '../../../pages/api/check-plan';
import hasPlan from '../../../pages/api/has-plan';
import { createMockReq, createMockRes } from '../../helpers/mockReqRes';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/session';

jest.mock('../../../lib/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    team: { findUnique: jest.fn() },
    teamMember: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
  },
}));

jest.mock('../../../lib/subscriptions', () => ({
  getCurrentPlan: jest.fn(),
  hasRequiredPlan: jest.fn(),
  normalizeSubscriptionPlan: jest.fn().mockReturnValue('PREMIUM'),
}));

const mockedPrisma = prisma as unknown as {
  team: { findUnique: jest.Mock };
  teamMember: { findUnique: jest.Mock };
  subscription: { findUnique: jest.Mock };
};

describe('Plan endpoint authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['check-plan', checkPlan, { slug: 'team' }],
    ['has-plan', hasPlan, { teamId: 'team-1', plan: 'PREMIUM' }],
  ])('rejects unauthenticated requests to %s', async (_, handler, body) => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({ method: 'POST', body });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockedPrisma.subscription.findUnique).not.toHaveBeenCalled();
  });

  it('does not disclose a plan to a user outside the requested team', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    mockedPrisma.team.findUnique.mockResolvedValue({ id: 'team-1' });
    mockedPrisma.teamMember.findUnique.mockResolvedValue(null);
    const req = createMockReq({
      method: 'POST',
      body: { slug: 'team' },
    });
    const res = createMockRes();

    await checkPlan(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockedPrisma.subscription.findUnique).not.toHaveBeenCalled();
  });
});
