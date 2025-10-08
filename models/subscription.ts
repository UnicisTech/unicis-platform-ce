import { prisma } from '@/lib/prisma';
import {
  Plan,
  SubscriptionStatus,
  Team,
  Subscription,
  PaymentStatus,
} from '@prisma/client';
import { getTeamMembers } from './team';

export const isTeamHasSubscription = async (teamId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { teamId },
  });
  return subscription;
};

export const addSubscription = async (teamId: string, email: string) => {
  await prisma.subscription.create({
    data: {
      teamId,
      userEmail: email,
      startDate: new Date(),
    },
  });
};

export const changeSubscription = async (
  teamId: string,
  plan: Plan,
  status: SubscriptionStatus
) => {
  return await prisma.subscription.update({
    where: { teamId },
    data: {
      plan,
      status,
    },
  });
};

export const addInitialPayment = async (
  team: Team,
  subscription: Subscription
) => {
  const members = await getTeamMembers(team.slug);
  const subscriptionId = subscription.id;
  return await prisma.payment.create({
    data: {
      subscriptionId,
      date: new Date(),
      amount: members.length,
      status: PaymentStatus.FAILED,
    },
  });
};
