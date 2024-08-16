import { prisma } from '@/lib/prisma';



export const createOrUpdateFleet = async (param: { userId: string, fleetId: string, accessPhrase: string }) => {
  
  const { accessPhrase, userId, fleetId } = param;

  return await prisma.fleetAccount.upsert({
    where: { userId },
    update: {
      connected: true,
      accessPhrase,
    },
    create: {
      userId,
      fleetId,
      connected: true,
      accessPhrase,
    },
  });
};

// Delete Fleet Account
export const deleteFleet = async (userId: string, fleetId: string) => {
  return await prisma.fleetAccount.delete({
    where: {userId, fleetId}
  });
}

// Get Fleet Account by User ID
export const getFleet = async (userId: string) => {
  return await prisma.fleetAccount.findUnique({
    where: {userId},
  });
}

export const disconnectFleet = async (userId: string) => {
  return await prisma.fleetAccount.update({
    where: { userId },
    data: {
      connected: false,
      accessPhrase: '',
    },
  });
}