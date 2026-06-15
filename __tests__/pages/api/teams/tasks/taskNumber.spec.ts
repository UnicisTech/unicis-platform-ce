import handler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/index';
import {
  createMockReq,
  createMockRes,
  mockTeamMember,
} from '../../../../helpers/mockReqRes';

jest.mock('models/team', () => ({
  throwIfNoTeamAccess: jest.fn(),
}));
jest.mock('models/user', () => ({
  throwIfNotAllowed: jest.fn(),
}));
jest.mock('models/task', () => ({
  getTaskBySlugAndNumber: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTaskAuditLogs: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('lib/sanitizeRichText', () => ({
  sanitizeRichText: jest.fn((x: string) => x),
}));
jest.mock('lib/svix', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('lib/notifications/notification-service', () => ({
  notificationService: { sendBulk: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('lib/notifications/recipients', () => ({
  getTeamRecipientsBySlug: jest.fn().mockResolvedValue([]),
}));
jest.mock('lib/serialize', () => ({
  serializeForApi: jest.fn((x) => x),
}));

import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { getTaskBySlugAndNumber, updateTask, deleteTask } from 'models/task';

const mockAuth = () => {
  (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
};

const baseTask = {
  id: 'task-1',
  taskNumber: 5,
  title: 'Existing Task',
  status: 'todo',
  priority: 'medium',
  duedate: null,
  description: '',
  properties: {},
};

describe('GET /api/teams/[slug]/tasks/[taskNumber]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('returns the task when found', async () => {
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(baseTask);

    const req = createMockReq({
      method: 'GET',
      query: { slug: 'test-team', taskNumber: '5' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data).toEqual(baseTask);
  });

  it('returns 404 when task does not exist', async () => {
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(null);

    const req = createMockReq({
      method: 'GET',
      query: { slug: 'test-team', taskNumber: '99' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it('returns 400 for non-numeric taskNumber', async () => {
    const req = createMockReq({
      method: 'GET',
      query: { slug: 'test-team', taskNumber: 'abc' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});

describe('PUT /api/teams/[slug]/tasks/[taskNumber]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('updates and returns the task', async () => {
    const updated = { ...baseTask, status: 'inprogress' };
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(baseTask);
    (updateTask as jest.Mock).mockResolvedValue(updated);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { data: { status: 'inprogress' } },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data.status).toBe('inprogress');
  });

  it('uses inprogress key — not in-progress — when updating status', async () => {
    const updated = { ...baseTask, status: 'inprogress' };
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(baseTask);
    (updateTask as jest.Mock).mockResolvedValue(updated);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { data: { status: 'inprogress' } },
    });
    const res = createMockRes();

    await handler(req, res);

    const callData = (updateTask as jest.Mock).mock.calls[0][2];
    expect(callData.status).toBe('inprogress');
    expect(callData.status).not.toBe('in-progress');
  });

  it('returns 400 for invalid priority', async () => {
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(baseTask);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { data: { priority: 'critical' } },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getBody().error.message).toMatch(/priority/i);
  });

  it('returns 400 for invalid duedate', async () => {
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(baseTask);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { data: { duedate: 'not-a-date' } },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 404 when task not found', async () => {
    (getTaskBySlugAndNumber as jest.Mock).mockResolvedValue(null);

    const req = createMockReq({
      method: 'PUT',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { data: { status: 'done' } },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});

describe('DELETE /api/teams/[slug]/tasks/[taskNumber]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('deletes and returns 200', async () => {
    (deleteTask as jest.Mock).mockResolvedValue(baseTask);

    const req = createMockReq({
      method: 'DELETE',
      query: { slug: 'test-team', taskNumber: '5' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(deleteTask).toHaveBeenCalledWith(5, 'test-team');
  });

  it('returns 404 when task not found', async () => {
    (deleteTask as jest.Mock).mockResolvedValue(null);

    const req = createMockReq({
      method: 'DELETE',
      query: { slug: 'test-team', taskNumber: '99' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
