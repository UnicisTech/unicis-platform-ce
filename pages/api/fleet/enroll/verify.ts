import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const serviceSecret = req.headers['x-fleet-secret'];
  if (!serviceSecret || serviceSecret !== process.env.FLEET_SERVICE_SECRET) {
    return res.status(401).json({ error: 'INVALID_SERVICE_SECRET' });
  }

  const { token } = req.body as { token?: string };

  if (!token) {
    return res.status(400).json({ error: 'TOKEN_REQUIRED' });
  }

  const enrollment = await prisma.fleetEnrollment.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, email: true } },
      team: { select: { id: true, slug: true, name: true } },
    },
  });

  if (!enrollment) {
    return res.status(404).json({ error: 'TOKEN_NOT_FOUND' });
  }

  const now = new Date();

  if (enrollment.status === 'COMPLETED') {
    return res.status(409).json({ error: 'ALREADY_ENROLLED' });
  }

  if (enrollment.expiresAt <= now) {
    return res.status(410).json({ error: 'TOKEN_EXPIRED' });
  }

  return res.status(200).json({
    valid: true,
    enrollment: {
      user: {
        id: enrollment.user.id,
        email: enrollment.user.email,
      },
      team: {
        id: enrollment.team.id,
        slug: enrollment.team.slug,
        name: enrollment.team.name,
      },
      expiresAt: enrollment.expiresAt,
    },
  });
}
