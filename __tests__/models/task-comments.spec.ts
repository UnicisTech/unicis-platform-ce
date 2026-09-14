jest.mock('lib/prisma', () => ({
  prisma: { task: { findFirst: jest.fn() } },
}));

import { prisma } from 'lib/prisma';
import { getTaskBySlugAndNumber } from 'models/task';

describe('getTaskBySlugAndNumber comment loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);
  });

  it('keeps lightweight comments by default without selecting avatar data', async () => {
    await getTaskBySlugAndNumber(5, 'team');

    const query = (prisma.task.findFirst as jest.Mock).mock.calls[0][0];
    expect(query.include.comments).toBeDefined();
    expect(query.include.comments.select.createdBy.select).toEqual({
      id: true,
      name: true,
      email: true,
    });
    expect(
      query.include.comments.select.createdBy.select.image
    ).toBeUndefined();
  });

  it('omits comments when includeComments is false', async () => {
    await getTaskBySlugAndNumber(5, 'team', { includeComments: false });

    const query = (prisma.task.findFirst as jest.Mock).mock.calls[0][0];
    expect(query.include.comments).toBeUndefined();
    expect(query.include.attachments).toBeDefined();
  });
});
