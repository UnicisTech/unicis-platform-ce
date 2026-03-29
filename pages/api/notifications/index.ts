import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';
import { getSession } from '@/lib/session';
import { serializeForApi } from '@/lib/serialize';

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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      data: null,
      error: { message: `Method ${req.method} Not Allowed` },
    });
  }

  const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const safePage =
    Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const safeLimit =
    Number.isFinite(limitNumber) && limitNumber > 0 && limitNumber <= 100
      ? limitNumber
      : 20;

  const skip = (safePage - 1) * safeLimit;
  const baseWhere = buildBaseWhere(session.user.id);
  const where = {
    ...baseWhere,
    ...(unreadOnly === 'true' ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        ...baseWhere,
        isRead: false,
      },
    }),
  ]);

  return res.status(200).json({
    data: {
      notifications: serializeForApi(notifications),
      total,
      unreadCount,
      page: safePage,
    },
    error: null,
  });
}
