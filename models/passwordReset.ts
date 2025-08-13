import { prisma } from '@/lib/prisma';

export const createPasswordReset = async ({ data }) => {
  return await prisma.passwordReset.create({
    data,
  });
};

//TODO: getPasswordReset and deletePasswordReset should be used in future afer user.lockedAt migration
// https://github.com/boxyhq/saas-starter-kit/tree/93b36b0d72bc0d4e0452237d199238f2d6626d4e/prisma/migrations/20231109082527_add_account_lockout
export const getPasswordReset = async (token: string) => {
  return await prisma.passwordReset.findUnique({
    where: {
      token,
    },
  });
};

export const deletePasswordReset = async (token: string) => {
  return await prisma.passwordReset.delete({
    where: {
      token,
    },
  });
};
