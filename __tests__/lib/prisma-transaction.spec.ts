jest.mock('lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

import { prisma } from 'lib/prisma';
import {
  isRetryableTransactionError,
  runSerializableTransaction,
  SERIALIZABLE_TRANSACTION_MAX_ATTEMPTS,
} from '@/lib/prisma-transaction';

const transaction = prisma.$transaction as jest.Mock;

describe('serializable transaction retry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs transactions at Serializable isolation', async () => {
    const tx = { task: {} };
    transaction.mockImplementation(async (operation) => operation(tx));

    await expect(
      runSerializableTransaction(async (transactionClient) =>
        transactionClient === tx ? 'result' : 'unexpected'
      )
    ).resolves.toBe('result');

    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it('retries Prisma write conflicts and serialization failures', async () => {
    const conflict = { code: 'P2034' };
    transaction
      .mockRejectedValueOnce(conflict)
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce('committed');

    await expect(
      runSerializableTransaction(async () => 'unused')
    ).resolves.toBe('committed');
    expect(transaction).toHaveBeenCalledTimes(3);
    expect(isRetryableTransactionError(conflict)).toBe(true);
  });

  it('does not retry unrelated errors', async () => {
    const error = new Error('connection failed');
    transaction.mockRejectedValue(error);

    await expect(runSerializableTransaction(async () => 'unused')).rejects.toBe(
      error
    );
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(isRetryableTransactionError(error)).toBe(false);
  });

  it('rethrows a conflict after the retry limit', async () => {
    const conflict = { code: 'P2034' };
    transaction.mockRejectedValue(conflict);

    await expect(runSerializableTransaction(async () => 'unused')).rejects.toBe(
      conflict
    );
    expect(transaction).toHaveBeenCalledTimes(
      SERIALIZABLE_TRANSACTION_MAX_ATTEMPTS
    );
  });
});
