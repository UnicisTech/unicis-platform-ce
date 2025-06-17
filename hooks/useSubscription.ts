import { Subscription, SubscriptionStatus, Plan } from '@prisma/client';

const params = {
  COMMUNITY: {
    maxUsers: 10,
    avaliableISO: ['default'],
  },
  PREMIUM: {
    maxUsers: 150,
    avaliableISO: ['default', '2013', '2022', 'uenis2'],
  },
  ULTIMATE: {
    maxUsers: 10000000,
    avaliableISO: ['default', '2013', '2022', 'nistcsfv2', 'uenis2'],
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
