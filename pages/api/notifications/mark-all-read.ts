import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';
import { getSession } from '@/lib/session';

const buildBaseWhere = (userId: string) => ({
  recipientId: userId,
  OR: [
    {
      metadata: {
        path: ['hidden'],
        equals: false,
      },
    },
    {
      metadata: {
        path: ['hidden'],
        equals: Prisma.JsonNull,
      },
    },
    {
      metadata: {
        equals: Prisma.DbNull,
      },
    },
  ],
});

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      data: null,
      error: { message: `Method ${req.method} Not Allowed` },
    });
  }

  await prisma.notification.updateMany({
    where: {
      ...buildBaseWhere(session.user.id),
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  });

  return res.status(200).json({ data: {}, error: null });
}
