import handler from '../../../../../pages/api/teams/[slug]/tasks/[taskNumber]/reactions';
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
jest.mock('models/commentReaction', () => ({
  toggleReaction: jest.fn(),
}));
jest.mock('lib/notifications/notification-service', () => ({
  notificationService: { sendBulk: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('lib/prisma', () => ({
  prisma: { comment: { findFirst: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';
import { toggleReaction } from 'models/commentReaction';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

describe('/api/teams/[slug]/tasks/[taskNumber]/reactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (throwIfNoTeamAccess as jest.Mock).mockResolvedValue(mockTeamMember);
    (throwIfNotAllowed as jest.Mock).mockReturnValue(undefined);
  });

  it('requires comment permission to toggle a reaction', async () => {
    (prisma.comment.findFirst as jest.Mock).mockResolvedValue({
      id: 10,
      createdById: 'user-1',
      createdBy: { id: 'user-1', email: 'test@example.com' },
      task: {
        id: 1,
        title: 'Test task',
        taskNumber: 5,
        teamId: 'team-1',
        team: { slug: 'test-team', name: 'Test Team' },
      },
    });
    (toggleReaction as jest.Mock).mockResolvedValue({ action: 'added' });
    const req = createMockReq({
      method: 'POST',
      query: { slug: 'test-team', taskNumber: '5' },
      body: { commentId: 10, emoji: '👍' },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(throwIfNotAllowed).toHaveBeenCalledWith(
      mockTeamMember,
      'task',
      'comment'
    );
    expect(toggleReaction).toHaveBeenCalledWith({
      commentId: 10,
      userId: 'user-1',
      emoji: '👍',
    });
  });
});
