import { prisma } from '@/lib/prisma';

export const deleteManySessions = async ({ where }) => {
  return await prisma.session.deleteMany({
    where,
  });
};