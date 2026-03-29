import { SubscriptionPermissions } from '@/lib/subscriptions';
import { Subscription, SubscriptionStatus, Plan } from '@/generated/browser';

const params: SubscriptionPermissions = {
  COMMUNITY: {
    maxUsers: 10,
    maxAdmins: 1,
    maxFrameworks: 1,
    teamFeatures: {
      sso: true,
      dsync: true,
    },
    avaliableISO: ['mvps', 'gdpr'],
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
      'owasp_asvs_v5',
      'iso42001',
    ],
  },
  ULTIMATE: {
    maxUsers: 10000000,
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
      'owasp_asvs_v5',
      'pcidss_v401',
      'iso42001',
    ],
  },
};

export const subscriptionParams = params;

const useSubscription = (subscription: Subscription) => {
  const currentPlan =
    subscription?.status === SubscriptionStatus.ACTIVE
      ? subscription.plan
      : Plan.COMMUNITY;

  return {
    currentPlan,
    avaliableISO: params[currentPlan].avaliableISO,
  };
};

export default useSubscription;
