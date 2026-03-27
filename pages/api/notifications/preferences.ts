import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({
      data: null,
      error: { message: 'Unauthorized' },
    });
  }

  if (req.method === 'GET') {
    const record = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    return res.status(200).json({
      data: { preferences: record?.preferences ?? {} },
      error: null,
    });
  }

  if (req.method === 'PATCH') {
    const { preferences } = req.body ?? {};

    const updated = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        preferences: preferences ?? {},
      },
      update: {
        preferences: preferences ?? {},
      },
    });

    return res.status(200).json({
      data: { preferences: updated.preferences },
      error: null,
    });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({
    data: null,
    error: { message: `Method ${req.method} Not Allowed` },
  });
}
