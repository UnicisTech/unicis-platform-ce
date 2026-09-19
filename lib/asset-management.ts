import type { Subscription } from '@/generated/client';
import env from '@/lib/env';
import { getCurrentPlan, hasRequiredPlan } from '@/lib/subscriptions';

export const hasAssetManagementPlan = (
  subscription?: Subscription | null
) => {
  return hasRequiredPlan(
    getCurrentPlan(subscription ?? null),
    env.assetRequiredPlan
  );
};
