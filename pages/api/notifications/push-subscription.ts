import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const parseBody = (req: NextApiRequest) => {
  const { endpoint, keys, userAgent } = req.body ?? {};
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint,
    p256dh,
    auth,
    userAgent: typeof userAgent === 'string' ? userAgent : null,
  };
};

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

  if (req.method === 'POST') {
    const parsed = parseBody(req);
    if (!parsed) {
      return res.status(400).json({
        data: null,
        error: { message: 'Invalid subscription payload' },
      });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: parsed.endpoint },
      create: {
        endpoint: parsed.endpoint,
        p256dhKey: parsed.p256dh,
        authKey: parsed.auth,
        userAgent: parsed.userAgent,
        userId: session.user.id,
      },
      update: {
        p256dhKey: parsed.p256dh,
        authKey: parsed.auth,
        userAgent: parsed.userAgent,
        userId: session.user.id,
      },
    });

    return res.status(200).json({ data: {}, error: null });
  }

  if (req.method === 'DELETE') {
    const parsed = parseBody(req);
    if (!parsed) {
      return res.status(400).json({
        data: null,
        error: { message: 'Invalid subscription payload' },
      });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: parsed.endpoint,
        userId: session.user.id,
      },
    });

    return res.status(200).json({ data: {}, error: null });
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  return res.status(405).json({
    data: null,
    error: { message: `Method ${req.method} Not Allowed` },
  });
}
