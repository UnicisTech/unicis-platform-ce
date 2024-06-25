// import { Subscription } from '@prisma/client';
import { Plan } from '@prisma/client';
import type { ISO } from 'types';

// export type SubscriptionType = (typeof Subscription)[keyof typeof Subscription];
type SubscriptionType = 'COMMUNITY' | 'PREMIUM' | 'ULTIMATE';
export type SubscriptionPermissions = {
  [subscription in SubscriptionType]: Permission;
};

export type Permission = {
  maxUsers: number;
  avaliableISO: ISO[];
};

// export const availableRoles = [
//   {
//     id: Subscription.COMMUNITY,
//     name: 'Community',
//   },
//   {
//     id: Subscription.PREMIUM,
//     name: 'Premium',
//   },
//   {
//     id: Subscription.ULTIMATE,
//     name: 'Ultimate',
//   },
// ];

export const subscriptions: SubscriptionPermissions = {
  COMMUNITY: {
    maxUsers: 10,
    avaliableISO: ['default'],
  },
  PREMIUM: {
    maxUsers: 150,
    avaliableISO: ['default', '2013', '2022'],
  },
  ULTIMATE: {
    maxUsers: 10000000,
    avaliableISO: ['default', '2013', '2022'],
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
