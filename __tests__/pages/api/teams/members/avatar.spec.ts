import handler from '../../../../../pages/api/teams/[slug]/members/[userId]/avatar';
import {
  createMockReq,
  createMockRes,
  mockTeamMember,
} from '../../../../helpers/mockReqRes';

jest.mock('models/team', () => ({
  throwIfNoTeamAccess: jest.fn(),
}));
jest.mock('lib/prisma', () => ({
  prisma: { teamMember: { findFirst: jest.fn() } },
}));

import { throwIfNoTeamAccess } from 'models/team';
import { prisma } from 'lib/prisma';

const query = { slug: 'test-team', userId: 'user-2' };

describe('GET team member avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  });

  it('returns a decoded image with private cache headers', async () => {
    const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02]);
    (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue({
      user: { image: `data:image/png;base64,${image.toString('base64')}` },
    });
    const req = createMockReq({ method: 'GET', query });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody()).toEqual(image);
    expect(res._getHeaders()['Content-Type']).toBe('image/png');
    expect(res._getHeaders()['Cache-Control']).toContain('private');
    expect(res._getHeaders().ETag).toBeDefined();
    expect(prisma.teamMember.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'team-1', userId: 'user-2' },
      })
    );
  });

  it('returns 304 for a matching ETag', async () => {
    const image = Buffer.from([0xff, 0xd8, 0xff, 0x01]);
    const dataUrl = `data:image/jpeg;base64,${image.toString('base64')}`;
    (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue({
      user: { image: dataUrl },
    });

    const initialReq = createMockReq({ method: 'GET', query });
    const initialRes = createMockRes();
    await handler(initialReq, initialRes);

    const req = createMockReq({
      method: 'GET',
      query,
      headers: { 'if-none-match': initialRes._getHeaders().ETag as string },
    });
    const res = createMockRes();
    await handler(req, res);

    expect(res._getStatusCode()).toBe(304);
  });

  it('rejects data URLs whose bytes do not match the MIME type', async () => {
    const invalidImage = Buffer.from('not a png');
    (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue({
      user: {
        image: `data:image/png;base64,${invalidImage.toString('base64')}`,
      },
    });
    const req = createMockReq({ method: 'GET', query });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(422);
  });

  it('returns 404 when the target is not a member of the team', async () => {
    (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({ method: 'GET', query });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
