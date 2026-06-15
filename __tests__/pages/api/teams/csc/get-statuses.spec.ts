import handler from '../../../../../pages/api/teams/[slug]/csc/[iso]/index';
import {
  createMockReq,
  createMockRes,
  mockTeamMember,
} from '../../../../helpers/mockReqRes';

jest.mock('models/team', () => ({
  throwIfNoTeamAccess: jest.fn(),
  getCscStatusesBySlugAndIso: jest.fn(),
}));
jest.mock('models/user', () => ({
  throwIfNotAllowed: jest.fn(),
}));

import { throwIfNoTeamAccess, getCscStatusesBySlugAndIso } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

const mockAuth = () => {
  (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
};

describe('GET /api/teams/[slug]/csc/[iso]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('returns the statuses map for the framework', async () => {
    const statuses = {
      'A.5.1': 'well-defined',
      'A.5.2': 'not-performed',
      'A.6.1': 'planned',
    };
    (getCscStatusesBySlugAndIso as jest.Mock).mockResolvedValue(statuses);

    const req = createMockReq({
      method: 'GET',
      query: { slug: 'test-team', iso: 'ISO/IEC 27001:2022' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data.statuses).toEqual(statuses);
    expect(getCscStatusesBySlugAndIso).toHaveBeenCalledWith(
      'test-team',
      'ISO/IEC 27001:2022'
    );
  });

  it('returns empty statuses map when no statuses configured yet', async () => {
    (getCscStatusesBySlugAndIso as jest.Mock).mockResolvedValue({});

    const req = createMockReq({
      method: 'GET',
      query: { slug: 'test-team', iso: 'GDPR' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data.statuses).toEqual({});
  });

  it('returns 405 for PUT', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', iso: 'ISO/IEC 27001:2022' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('returns 405 for DELETE', async () => {
    const req = createMockReq({
      method: 'DELETE',
      query: { slug: 'test-team', iso: 'ISO/IEC 27001:2022' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
