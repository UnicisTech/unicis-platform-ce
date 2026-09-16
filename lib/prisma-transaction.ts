import type { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';

export const SERIALIZABLE_TRANSACTION_MAX_ATTEMPTS = 3;

export const isRetryableTransactionError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'P2034';

export const runSerializableTransaction = async <Result>(
  operation: (tx: Prisma.TransactionClient) => Promise<Result>
): Promise<Result> => {
  for (
    let attempt = 1;
    attempt <= SERIALIZABLE_TRANSACTION_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: 'Serializable',
      });
    } catch (error) {
      const canRetry =
        isRetryableTransactionError(error) &&
        attempt < SERIALIZABLE_TRANSACTION_MAX_ATTEMPTS;

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw new Error('Serializable transaction retry loop exhausted');
};
