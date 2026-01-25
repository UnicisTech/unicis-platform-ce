import { Plan, Subscription, SubscriptionStatus } from '@prisma/client';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { ISO, TeamFeature } from 'types';
import { getSession } from './session';
import { getTeamMember } from 'models/team';

// export type SubscriptionType = (typeof Subscription)[keyof typeof Subscription];
type SubscriptionType = 'COMMUNITY' | 'PREMIUM' | 'ULTIMATE';
export type SubscriptionPermissions = {
  [subscription in SubscriptionType]: Permission;
};

export type Permission = {
  maxUsers: number;
  maxAdmins: number;
  maxFrameworks: number;
  teamFeatures: TeamFeature;
  avaliableISO: ISO[];
};

export const subscriptions: SubscriptionPermissions = {
  COMMUNITY: {
    maxUsers: 10,
    maxAdmins: 1,
    maxFrameworks: 1,
    teamFeatures: {
      sso: true,
      dsync: true,
    },
    avaliableISO: ['mvps'],
  },
  PREMIUM: {
    maxUsers: 150,
    maxAdmins: 5,
    maxFrameworks: 3,
    teamFeatures: {
      sso: true,
      dsync: true,
      apiKey: true,
      webhook: true,
    },
    avaliableISO: [
      'mvps',
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
    teamFeatures: {
      sso: true,
      dsync: true,
      apiKey: true,
      webhook: true,
      auditLog: true,
    },
    avaliableISO: [
      'mvps',
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

export const getCurrentPlan = (subscription: Subscription | null) => {
  return subscription?.status === SubscriptionStatus.ACTIVE
    ? subscription.plan
    : Plan.COMMUNITY;
};
