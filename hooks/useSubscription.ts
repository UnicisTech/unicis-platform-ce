import { Subscription, SubscriptionStatus, Plan } from '@prisma/client';

const params = {
  COMMUNITY: {
    maxUsers: 10,
    avaliableISO: ['default'],
  },
  PREMIUM: {
    maxUsers: 150,
    avaliableISO: ['default', '2013', '2022', 'eunis2', 'gdpr', 'cisv81'],
  },
  ULTIMATE: {
    maxUsers: 10000000,
    avaliableISO: [
      'default',
      '2013',
      '2022',
      'nistcsfv2',
      'eunis2',
      'gdpr',
      'cisv81',
    ],
  },
};

const useSubscription = (subscription: Subscription) => {
  console.log('subsuseSubscription cription', subscription);

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
