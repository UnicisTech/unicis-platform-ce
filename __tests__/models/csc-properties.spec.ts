jest.mock('lib/prisma', () => ({
  prisma: {
    task: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from 'lib/prisma';
import { addControlsToIssue } from 'models/csc';
import type { Session } from 'next-auth';

const prismaTask = prisma.task as unknown as {
  findFirst: jest.Mock;
  update: jest.Mock;
};

const user = {
  id: 'user-1',
  name: 'User',
  email: 'user@example.com',
  image: null,
  roles: [],
} satisfies Session['user'];

describe('CSC properties writes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaTask.update.mockResolvedValue({ id: 1 });
  });

  it('preserves unrelated properties and accumulates audit logs immutably', async () => {
    const properties = Object.freeze({
      custom: { preserved: true },
      csc_controls: ['legacy-control'],
    });
    prismaTask.findFirst.mockResolvedValue({ id: 1, properties });

    await addControlsToIssue({
      user,
      taskNumber: 7,
      slug: 'team',
      controls: ['mvsp-1', 'mvsp-2'],
      ISO: 'mvsp',
    });

    expect(prismaTask.update).toHaveBeenCalledTimes(3);
    expect(prismaTask.update.mock.calls[0][0].data.properties).toEqual({
      custom: { preserved: true },
      csc_controls: ['legacy-control'],
      csc_controls_mvsp: ['mvsp-1', 'mvsp-2'],
    });
    expect(prismaTask.update.mock.calls[2][0].data.properties).toEqual(
      expect.objectContaining({
        custom: { preserved: true },
        csc_controls: ['legacy-control'],
        csc_controls_mvsp: ['mvsp-1', 'mvsp-2'],
        csc_audit_logs: [
          expect.objectContaining({
            event: 'added',
            diff: { prevValue: null, nextValue: 'mvsp-1' },
          }),
          expect.objectContaining({
            event: 'added',
            diff: { prevValue: null, nextValue: 'mvsp-2' },
          }),
        ],
      })
    );
    expect(properties).toEqual({
      custom: { preserved: true },
      csc_controls: ['legacy-control'],
    });
  });
});
