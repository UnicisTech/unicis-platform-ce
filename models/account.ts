import { prisma } from '@/lib/prisma';

export const getAccount = async (key: { userId: string }) => {
  return await prisma.account.findFirst({
    where: key,
  });
};

async function updateFleetAccess(identifier: { userId?: string, userEmail?: string }, access: string) {
  try {
    // Update based on userId
    if (identifier.userId) {
      const updatedAccount = await prisma.account.updateMany({
        where: {
          userId: identifier.userId,
        },
        data: {
          fleetAccess: access,
        },
      });
      return updatedAccount;
    }
    
    // Update based on userEmail
    if (identifier.userEmail) {
      const updatedAccount = await prisma.account.updateMany({
        where: {
          user: {
            email: identifier.userEmail,
          },
        },
        data: {
          fleetAccess: access,
        },
      });
      return updatedAccount;
    }
    
    throw new Error('Either userId or userEmail must be provided');
  } catch (error) {
    console.error('Error updating fleetAccess:', error);
    throw new Error('Unable to update fleetAccess');
  }
}