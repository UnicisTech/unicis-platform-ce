import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getCurrentPlan, hasRequiredPlan } from '@/lib/subscriptions';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method Not Allowed', hasPlan: false });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Missing team slug', hasPlan: false });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { slug },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found', hasPlan: false });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { teamId: team.id },
    });

    if (!subscription) {
      return res
        .status(403)
        .json({ error: 'No active subscription', hasPlan: false });
    }

    const currentPlan = getCurrentPlan(subscription);

    if (!hasRequiredPlan(currentPlan, env.assetRequiredPlan)) {
      return res
        .status(403)
        .json({ error: 'Insufficient plan', hasPlan: false });
    }

    return res.status(200).json({ hasPlan: true });
  } catch (error) {
    console.error('Error checking plan:', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', hasPlan: false });
  }
}
