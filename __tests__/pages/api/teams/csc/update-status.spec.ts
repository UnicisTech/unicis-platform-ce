import handler from '../../../../../pages/api/teams/[slug]/csc/index';
import {
  createMockReq,
  createMockRes,
  mockTeamMember,
} from '../../../../helpers/mockReqRes';

jest.mock('models/team', () => ({
  throwIfNoTeamAccess: jest.fn(),
  setCscStatus: jest.fn(),
}));
jest.mock('models/user', () => ({
  throwIfNotAllowed: jest.fn(),
}));

import { throwIfNoTeamAccess, setCscStatus } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

const mockAuth = () => {
  (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
};

describe('PUT /api/teams/[slug]/csc — update single control status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('updates a control status and returns the updated statuses map', async () => {
    const updatedStatuses = {
      'A.5.1': 'well-defined',
      'A.5.2': 'not-performed',
    };
    (setCscStatus as jest.Mock).mockResolvedValue(updatedStatuses);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team' },
      body: {
        control: 'A.5.1',
        value: 'well-defined',
        framework: 'ISO/IEC 27001:2022',
      },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data.statuses).toEqual(updatedStatuses);
    expect(setCscStatus).toHaveBeenCalledWith({
      slug: 'test-team',
      control: 'A.5.1',
      value: 'well-defined',
      framework: 'ISO/IEC 27001:2022',
    });
  });

  it('passes the exact control id and value to setCscStatus', async () => {
    (setCscStatus as jest.Mock).mockResolvedValue({});

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team' },
      body: {
        control: 'B.7.3',
        value: 'continuously-improving',
        framework: 'GDPR',
      },
    });
    const res = createMockRes();

    await handler(req, res);

    const call = (setCscStatus as jest.Mock).mock.calls[0][0];
    expect(call.control).toBe('B.7.3');
    expect(call.value).toBe('continuously-improving');
    expect(call.framework).toBe('GDPR');
    expect(call.slug).toBe('test-team');
  });

  it('returns 405 for GET', async () => {
    const req = createMockReq({ method: 'GET', query: { slug: 'test-team' } });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('returns 405 for DELETE', async () => {
    const req = createMockReq({
      method: 'DELETE',
      query: { slug: 'test-team' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('returns 405 for POST', async () => {
    const req = createMockReq({ method: 'POST', query: { slug: 'test-team' } });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
