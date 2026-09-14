jest.mock('lib/prisma', () => ({
  prisma: {
    task: { findFirst: jest.fn() },
    comment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from 'lib/prisma';
import { deleteComment, getTaskComments, updateComment } from 'models/comment';

const comment = (id: number) => ({
  id,
  text: `Comment ${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  taskId: 7,
  createdById: 'user-1',
  createdBy: { id: 'user-1', name: 'User' },
  reactions: [],
});

describe('comment model', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a chronological cursor page and a cursor for older comments', async () => {
    (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 7 });
    (prisma.comment.findMany as jest.Mock).mockResolvedValue([
      comment(5),
      comment(4),
      comment(3),
    ]);
    (prisma.comment.count as jest.Mock).mockResolvedValue(5);

    const page = await getTaskComments({
      slug: 'team',
      taskNumber: 1,
      limit: 2,
    });

    expect(page?.items.map(({ id }) => id)).toEqual([4, 5]);
    expect(page?.pageInfo).toEqual({ hasMore: true, nextCursor: 4 });
    expect(page?.totalCount).toBe(5);
    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId: 7 },
        orderBy: { id: 'desc' },
        take: 3,
      })
    );
  });

  it('applies the cursor as an exclusive upper comment ID', async () => {
    (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 7 });
    (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.comment.count as jest.Mock).mockResolvedValue(5);

    await getTaskComments({
      slug: 'team',
      taskNumber: 1,
      limit: 2,
      cursor: 4,
    });

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId: 7, id: { lt: 4 } },
      })
    );
  });

  it('scopes updates to task number and team slug', async () => {
    (prisma.comment.findFirst as jest.Mock).mockResolvedValue({ id: 3 });
    (prisma.comment.update as jest.Mock).mockResolvedValue(comment(3));

    await updateComment({
      id: 3,
      text: 'Updated',
      taskNumber: 1,
      slug: 'team',
    });

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 3,
        task: { taskNumber: 1, team: { slug: 'team' } },
      },
      select: { id: true },
    });
  });

  it('does not delete a comment outside the scoped task', async () => {
    (prisma.comment.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await deleteComment({
      id: 3,
      taskNumber: 1,
      slug: 'team',
    });

    expect(result).toBeNull();
    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });
});
