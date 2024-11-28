import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getCurrentPlan } from '@/lib/subscriptions';
import { $Enums } from '@prisma/client';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Missing team slug' });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { slug },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { teamId: team.id },
    });

    if (!subscription) {
      return res.status(403).json({ error: 'No active subscription' });
    }

    const currentPlan = getCurrentPlan(subscription);

    if (currentPlan !== env.assetRequiredPlan) {
      return res.status(403).json({ error: 'Insufficient plan' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error checking plan:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
