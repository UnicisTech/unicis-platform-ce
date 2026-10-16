import type { Subscription } from '@/generated/client';
import env from '@/lib/env';
import { getCurrentPlan, hasRequiredPlan } from '@/lib/subscriptions';

export const hasAssetManagementPlan = (subscription?: Subscription | null) => {
  return hasRequiredPlan(
    getCurrentPlan(subscription ?? null),
    env.assetRequiredPlan
  );
};

/** Asset Management settings (tags, queries, packs, distributors) are not available to auditors. */
export const isTeamAuditor = async (teamId: string, userId: string) => {
  const { prisma } = await import('@/lib/prisma');
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId },
    select: { role: true },
  });
  return member?.role === 'AUDITOR';
};
