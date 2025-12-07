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
    avaliableISO: ['default'],
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
    teamFeatures: {
      sso: true,
      dsync: true,
      apiKey: true,
      webhook: true,
      auditLog: true,
    },
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

export const getTeamFeatures = async (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res'],
  query: any
) => {
  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  const currentPlan = getCurrentPlan(teamMember.team.subscription);

  return subscriptions[currentPlan].teamFeatures;
};
