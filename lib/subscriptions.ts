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
  maxFrameworks: number;
  avaliableISO: ISO[];
};

export const subscriptions: SubscriptionPermissions = {
  COMMUNITY: {
    maxUsers: 10,
    maxAdmins: 1,
    maxFrameworks: 1,
    avaliableISO: ['default'],
  },
  PREMIUM: {
    maxUsers: 150,
    maxAdmins: 5,
    maxFrameworks: 3,
    avaliableISO: [
      'default',
      '2013',
      '2022',
      'eunis2',
      'gdpr',
      'cisv81',
      'c5_2020',
    ],
  },
  ULTIMATE: {
    maxUsers: 1000000,
    maxAdmins: 1000000,
    maxFrameworks: 100,
    avaliableISO: [
      'default',
      '2013',
      '2022',
      'nistcsfv2',
      'eunis2',
      'gdpr',
      'cisv81',
      'soc2v2',
      'c5_2020',
    ],
  },
};

export const planPrice = {
  [Plan.COMMUNITY]: 0,
  [Plan.PREMIUM]: 49,
  [Plan.ULTIMATE]: 89,
};

export const getTotalPrice = (plan: Plan, amount: number) => {
  const total: number = planPrice[plan] * amount;
  return total;
};

export const getCurrentPlan = (subscription: Subscription | null) => {
  return subscription?.status === SubscriptionStatus.ACTIVE
    ? subscription.plan
    : Plan.COMMUNITY;
};
