import rpaHandler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/rpa';
import tiaHandler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/tia';
import piaHandler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/pia';
import rmHandler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/rm';
import cscHandler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/csc';
import cscStatusHandler from '../../../../../pages/api/teams/[slug]/csc/index';
import cscIsoHandler from '../../../../../pages/api/teams/[slug]/csc/iso';
import {
  createMockReq,
  createMockRes,
  mockTeamMember,
} from '../../../../helpers/mockReqRes';

jest.mock('models/team', () => ({
  throwIfNoTeamAccess: jest.fn(),
  getCscIso: jest.fn(),
  setCscIso: jest.fn(),
  setCscStatus: jest.fn(),
}));
jest.mock('models/user', () => ({
  throwIfNotAllowed: jest.fn(),
}));
jest.mock('models/rpa', () => ({
  saveProcedure: jest.fn(),
  deleteProcedure: jest.fn(),
}));
jest.mock('models/tia', () => ({
  saveProcedure: jest.fn(),
  deleteProcedure: jest.fn(),
}));
jest.mock('models/pia', () => ({
  saveRisk: jest.fn(),
  deleteRisk: jest.fn(),
}));
jest.mock('models/rm', () => ({
  saveRisk: jest.fn(),
  deleteRisk: jest.fn(),
}));
jest.mock('models/csc', () => ({
  addControlsToIssue: jest.fn(),
  changeControlInIssue: jest.fn(),
  removeControlsFromIssue: jest.fn(),
}));
jest.mock('lib/matomo/server', () => ({
  trackServerEvent: jest.fn(),
}));

import { setCscIso, setCscStatus, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { saveProcedure as saveRpaProcedure } from 'models/rpa';
import { saveProcedure as saveTiaProcedure } from 'models/tia';
import { saveRisk as savePiaRisk } from 'models/pia';
import { saveRisk as saveRmRisk } from 'models/rm';
import {
  addControlsToIssue,
  changeControlInIssue,
  removeControlsFromIssue,
} from 'models/csc';

const mockAuth = () => {
  (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
};

const createWriteRequest = (body: unknown) =>
  createMockReq({
    method: 'POST',
    query: { slug: 'test-team', taskNumber: '5' },
    body,
  });

describe('task properties API validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it.each([
    ['RPA', rpaHandler, saveRpaProcedure, 'nextProcedure'],
    ['TIA', tiaHandler, saveTiaProcedure, 'nextProcedure'],
    ['PIA', piaHandler, savePiaRisk, 'nextRisk'],
    ['RM', rmHandler, saveRmRisk, 'nextRisk'],
  ])(
    'rejects malformed %s writes before calling the model',
    async (_name, handler, modelFunction, nextProperty) => {
      const req = createWriteRequest({
        prevProcedure: [],
        prevRisk: [],
        [nextProperty]: [{ malformed: true }],
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getBody()).toMatchObject({
        data: null,
        error: {
          message: 'Invalid request body',
          issues: expect.any(Array),
        },
      });
      expect(modelFunction).not.toHaveBeenCalled();
    }
  );

  it('rejects an unsupported CSC operation before calling the model', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: {
        operation: 'replace',
        controls: ['old-control', 'new-control'],
        ISO: 'mvsp',
      },
    });
    const res = createMockRes();

    await cscHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(addControlsToIssue).not.toHaveBeenCalled();
    expect(removeControlsFromIssue).not.toHaveBeenCalled();
    expect(changeControlInIssue).not.toHaveBeenCalled();
  });

  it('rejects a CSC change without both control ids', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: {
        operation: 'change',
        controls: ['old-control'],
        ISO: 'mvsp',
      },
    });
    const res = createMockRes();

    await cscHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(changeControlInIssue).not.toHaveBeenCalled();
  });

  it('routes a valid CSC change to the matching model function', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: {
        operation: 'change',
        controls: ['old-control', 'new-control'],
        ISO: 'iso-2022',
      },
    });
    const res = createMockRes();

    await cscHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(changeControlInIssue).toHaveBeenCalledWith({
      user: mockTeamMember.user,
      taskNumber: 5,
      slug: 'test-team',
      controls: ['old-control', 'new-control'],
      ISO: 'iso-2022',
    });
    expect(addControlsToIssue).not.toHaveBeenCalled();
    expect(removeControlsFromIssue).not.toHaveBeenCalled();
  });

  it('rejects an invalid team CSC status', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team' },
      body: {
        control: 'control-1',
        value: 'invalid-status',
        framework: 'mvsp',
      },
    });
    const res = createMockRes();

    await cscStatusHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(setCscStatus).not.toHaveBeenCalled();
  });

  it('rejects invalid team CSC framework selections', async () => {
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team' },
      body: { iso: ['invalid-framework'] },
    });
    const res = createMockRes();

    await cscIsoHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(setCscIso).not.toHaveBeenCalled();
  });

  it('passes validated CSC framework selections to the model', async () => {
    (setCscIso as jest.Mock).mockResolvedValue(['mvsp']);
    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team' },
      body: { iso: ['mvsp'] },
    });
    const res = createMockRes();

    await cscIsoHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(setCscIso).toHaveBeenCalledWith({
      slug: 'test-team',
      iso: ['mvsp'],
    });
  });
});
