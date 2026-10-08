import { getCurrentPlan, hasRequiredPlan } from '@/lib/subscriptions';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getSession(req, res);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { teamId, plan } = req.body;

  if (!teamId || !plan) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { teamId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    const currentPlan = getCurrentPlan(subscription);
    const isPlanActive = hasRequiredPlan(currentPlan, plan);

    res.status(200).json({ hasPlan: isPlanActive, currentPlan: currentPlan });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
}
