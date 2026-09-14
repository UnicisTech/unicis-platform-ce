import handler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/comments';
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
jest.mock('models/comment', () => ({
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  getTaskComments: jest.fn(),
  updateComment: jest.fn(),
}));
jest.mock('lib/sanitizeRichText', () => ({
  sanitizeRichText: jest.fn((value: string) => value),
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
jest.mock('lib/prisma', () => ({
  prisma: { task: { findFirst: jest.fn() } },
}));
jest.mock('lib/serialize', () => ({
  serializeForApi: jest.fn((value) => value),
}));

import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { deleteComment, getTaskComments, updateComment } from 'models/comment';

const baseQuery = { slug: 'test-team', taskNumber: '5' };
const commentsPage = {
  items: [
    {
      id: 10,
      text: 'Comment',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      taskId: 1,
      createdById: 'user-1',
      createdBy: { id: 'user-1', name: 'Test User' },
      reactions: [],
    },
  ],
  totalCount: 1,
  pageInfo: { hasMore: false, nextCursor: null },
};

describe('/api/teams/[slug]/tasks/[taskNumber]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
    (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
  });

  it('returns all comments in the pagination envelope by default', async () => {
    (getTaskComments as jest.Mock).mockResolvedValue(commentsPage);
    const req = createMockReq({ method: 'GET', query: baseQuery });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getBody().data).toEqual(commentsPage);
    expect(getTaskComments).toHaveBeenCalledWith({
      slug: 'test-team',
      taskNumber: 5,
      limit: undefined,
      cursor: undefined,
    });
    expect(throwIfNotAllowed).toHaveBeenCalledWith(
      mockTeamMember,
      'task',
      'read'
    );
  });

  it('forwards valid cursor pagination parameters', async () => {
    (getTaskComments as jest.Mock).mockResolvedValue(commentsPage);
    const req = createMockReq({
      method: 'GET',
      query: { ...baseQuery, limit: '20', cursor: '100' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(getTaskComments).toHaveBeenCalledWith({
      slug: 'test-team',
      taskNumber: 5,
      limit: 20,
      cursor: 100,
    });
  });

  it('rejects invalid pagination parameters', async () => {
    const req = createMockReq({
      method: 'GET',
      query: { ...baseQuery, limit: '101' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(getTaskComments).not.toHaveBeenCalled();
  });

  it('requires a limit when a cursor is provided', async () => {
    const req = createMockReq({
      method: 'GET',
      query: { ...baseQuery, cursor: '100' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(getTaskComments).not.toHaveBeenCalled();
  });

  it('returns 404 when the task does not exist', async () => {
    (getTaskComments as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({ method: 'GET', query: baseQuery });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it('scopes comment updates to the task and team from the URL', async () => {
    (updateComment as jest.Mock).mockResolvedValue({ id: 10 });
    const req = createMockReq({
      method: 'PUT',
      query: baseQuery,
      body: { id: 10, text: 'Updated' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(updateComment).toHaveBeenCalledWith({
      id: 10,
      text: 'Updated',
      taskNumber: 5,
      slug: 'test-team',
    });
  });

  it('scopes comment deletion to the task and team from the URL', async () => {
    (deleteComment as jest.Mock).mockResolvedValue({ id: 10 });
    const req = createMockReq({
      method: 'DELETE',
      query: baseQuery,
      body: { id: 10 },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(deleteComment).toHaveBeenCalledWith({
      id: 10,
      taskNumber: 5,
      slug: 'test-team',
    });
  });

  it('returns 404 when a scoped comment is not found', async () => {
    (updateComment as jest.Mock).mockResolvedValue(null);
    const req = createMockReq({
      method: 'PUT',
      query: baseQuery,
      body: { id: 99, text: 'Updated' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });
});
