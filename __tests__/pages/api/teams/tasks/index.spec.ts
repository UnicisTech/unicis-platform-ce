import handler from '../../../../../pages/api/teams/[slug]/tasks/index';
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
  getTeamTasks: jest.fn(),
  createTask: jest.fn(),
}));
jest.mock('lib/sanitizeRichText', () => ({
  sanitizeRichText: jest.fn((x: string) => x),
}));
jest.mock('lib/tasks/task-events', () => ({
  publishTaskCreated: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('lib/serialize', () => ({
  serializeForApi: jest.fn((x) => x),
}));

import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { getTeamTasks, createTask } from 'models/task';

const mockAuth = () => {
  (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
  (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
};

describe('GET /api/teams/[slug]/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('returns 200 with task list', async () => {
    const tasks = [
      { id: 't1', taskNumber: 1, title: 'Task 1', status: 'todo' },
      { id: 't2', taskNumber: 2, title: 'Task 2', status: 'inprogress' },
    ];
    (getTeamTasks as jest.Mock).mockResolvedValue(tasks);

    const req = createMockReq({ method: 'GET', query: { slug: 'test-team' } });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data).toEqual(tasks);
    expect(res._getBody().error).toBeNull();
  });

  it('returns tasks with correct status values (no hyphenated variants)', async () => {
    const tasks = [
      { id: 't1', status: 'inprogress' },
      { id: 't2', status: 'inreview' },
    ];
    (getTeamTasks as jest.Mock).mockResolvedValue(tasks);

    const req = createMockReq({ method: 'GET', query: { slug: 'test-team' } });
    const res = createMockRes();

    await handler(req, res);

    const data = res._getBody().data as any[];
    for (const task of data) {
      expect(task.status).not.toMatch(/in-progress|in-review/);
    }
  });
});

describe('POST /api/teams/[slug]/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('creates a task and returns 200', async () => {
    (createTask as jest.Mock).mockResolvedValue({ id: 't1', taskNumber: 1 });

    const req = createMockReq({
      method: 'POST',
      query: { slug: 'test-team' },
      body: { title: 'New Task', status: 'todo', priority: 'medium' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Task', status: 'todo' })
    );
  });

  it('returns 400 for invalid priority', async () => {
    const req = createMockReq({
      method: 'POST',
      query: { slug: 'test-team' },
      body: { title: 'Task', status: 'todo', priority: 'urgent' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getBody().error.message).toMatch(/priority/i);
  });

  it('returns 400 for invalid duedate', async () => {
    const req = createMockReq({
      method: 'POST',
      query: { slug: 'test-team' },
      body: { title: 'Task', status: 'todo', duedate: 'not-a-date' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getBody().error.message).toMatch(/due date/i);
  });
});

describe('unsupported methods — /api/teams/[slug]/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  it('returns 405 for PUT', async () => {
    const req = createMockReq({ method: 'PUT', query: { slug: 'test-team' } });
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
});
