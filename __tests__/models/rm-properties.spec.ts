jest.mock('lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    task: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from 'lib/prisma';
import { saveRisk } from 'models/rm';
import type { Session } from 'next-auth';
import type { RMProcedureInterface } from 'types';

const prismaTask = prisma.task as unknown as {
  findFirst: jest.Mock;
  update: jest.Mock;
};
const prismaTransaction = prisma.$transaction as jest.Mock;

const user = {
  id: 'user-1',
  name: 'User',
  email: 'user@example.com',
  image: null,
  roles: [],
} satisfies Session['user'];

const previousRisk: RMProcedureInterface = [
  {
    Risk: 'Previous risk',
    AssetOwner: 'user-1',
    Impact: 'Availability',
    RawProbability: 20,
    RawImpact: 40,
  },
  {
    RiskTreatment: 'Mitigate',
    TreatmentCost: 'Medium',
    TreatmentStatus: 25,
    TreatedProbability: 10,
    TreatedImpact: 20,
  },
];

const nextRisk: RMProcedureInterface = [
  { ...previousRisk[0], Risk: 'Updated risk' },
  previousRisk[1],
];

describe('RM properties transaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaTransaction.mockImplementation(async (operation) =>
      operation(prisma)
    );
    prismaTask.update.mockResolvedValue({ id: 1 });
  });

  it('updates the module and audit log together from the stored value', async () => {
    const properties = Object.freeze({
      custom: { preserved: true },
      rm_risk: previousRisk,
      rm_audit_logs: [{ legacy: true }],
    });
    prismaTask.findFirst.mockResolvedValue({ id: 1, properties });

    await saveRisk({
      user,
      taskNumber: 7,
      slug: 'team',
      nextRisk,
    });

    expect(prismaTransaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
    expect(prismaTask.update).toHaveBeenCalledTimes(1);
    expect(prismaTask.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        properties: {
          custom: { preserved: true },
          rm_risk: nextRisk,
          rm_audit_logs: [
            { legacy: true },
            expect.objectContaining({
              event: 'updated',
              diff: {
                field: 'Risk',
                prevValue: 'Previous risk',
                nextValue: 'Updated risk',
              },
            }),
          ],
        },
      },
    });
    expect(properties.rm_risk).toBe(previousRisk);
  });

  it('rebuilds the write from the latest properties after a conflict', async () => {
    const conflict = { code: 'P2034' };
    const firstSnapshot = {
      custom: 'first-snapshot',
      rm_risk: previousRisk,
    };
    const latestSnapshot = {
      custom: 'latest-snapshot',
      concurrent_property: { preserved: true },
      rm_risk: previousRisk,
    };
    prismaTask.findFirst
      .mockResolvedValueOnce({ id: 1, properties: firstSnapshot })
      .mockResolvedValueOnce({ id: 1, properties: latestSnapshot });

    let attempt = 0;
    prismaTransaction.mockImplementation(async (operation) => {
      const result = await operation(prisma);
      attempt++;
      if (attempt === 1) throw conflict;
      return result;
    });

    await saveRisk({
      user,
      taskNumber: 7,
      slug: 'team',
      nextRisk,
    });

    expect(prismaTransaction).toHaveBeenCalledTimes(2);
    expect(prismaTask.findFirst).toHaveBeenCalledTimes(2);
    expect(prismaTask.update).toHaveBeenCalledTimes(2);
    expect(prismaTask.update.mock.calls[1][0].data.properties).toEqual(
      expect.objectContaining({
        custom: 'latest-snapshot',
        concurrent_property: { preserved: true },
        rm_risk: nextRisk,
      })
    );
  });
});
