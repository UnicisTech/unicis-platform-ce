import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * Debug endpoint to check enrollment statuses
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teamId } = req.query;

    const enrollments = await prisma.fleetEnrollment.findMany({
      where: teamId ? { teamId: teamId as string } : undefined,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return res.status(200).json({
      count: enrollments.length,
      enrollments: enrollments.map((e) => ({
        userEmail: e.user.email,
        status: e.status,
        sentAt: e.sentAt,
        expiresAt: e.expiresAt,
        teamId: e.teamId,
      })),
    });
  } catch (err) {
    console.error('[DebugEnrollments] Error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
