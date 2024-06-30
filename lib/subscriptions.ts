import { Plan, Subscription, SubscriptionStatus } from '@prisma/client';
import type { ISO } from 'types';

// export type SubscriptionType = (typeof Subscription)[keyof typeof Subscription];
type SubscriptionType = 'COMMUNITY' | 'PREMIUM' | 'ULTIMATE';
export type SubscriptionPermissions = {
  [subscription in SubscriptionType]: Permission;
};

export type Permission = {
  maxUsers: number;
  maxAdmins: number;
  avaliableISO: ISO[];
};

export const subscriptions: SubscriptionPermissions = {
  COMMUNITY: {
    maxUsers: 10,
    maxAdmins: 1,
    avaliableISO: ['default'],
  },
  PREMIUM: {
    maxUsers: 150,
    maxAdmins: 5,
    avaliableISO: ['default', '2013', '2022'],
  },
  ULTIMATE: {
    maxUsers: 1000000,
    maxAdmins: 1000000,
    avaliableISO: ['default', '2013', '2022', 'nistcsfv2'],
  },
};

export const userPrice = 49;

export const planPrice = {
  [Plan.COMMUNITY]: 0,
  [Plan.PREMIUM]: 49,
  [Plan.ULTIMATE]: 89,
};

export const getTotalPrice = (plan: Plan, amount: number) => {
  const total: number = planPrice[plan] + userPrice * amount;
  return total;
};

export const getCurrentPlan = (subscription: Subscription | null) => {
  return subscription?.status === SubscriptionStatus.ACTIVE
    ? subscription.plan
    : Plan.COMMUNITY;
};
