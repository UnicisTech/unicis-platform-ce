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

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({
      data: null,
      error: { message: `Method ${req.method} Not Allowed` },
    });
  }

  const { id } = req.query;

  const notification = await prisma.notification.findFirst({
    where: {
      id: String(id),
      recipientId: session.user.id,
    },
  });

  if (!notification) {
    return res.status(404).json({
      data: null,
      error: { message: 'Not found' },
    });
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true, readAt: new Date() },
  });

  return res.status(200).json({ data: {}, error: null });
}
