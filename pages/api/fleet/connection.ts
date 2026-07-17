import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  fleetAccessTokenCookieName,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';

const DEFAULT_RETENTION_DAYS = 0;

const addRetentionPeriod = (date: Date) => {
  const deleteAfter = new Date(date);
  const retentionDays = Number(
    process.env.FLEET_DISCONNECT_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS
  );

  deleteAfter.setDate(
    deleteAfter.getDate() +
      (Number.isFinite(retentionDays) ? retentionDays : DEFAULT_RETENTION_DAYS)
  );

  return deleteAfter;
};

const expireFleetCookies = () => [
  `${fleetAccessTokenCookieName}=; Path=/; Max-Age=0; SameSite=Strict`,
  `${legacyFleetAccessTokenCookieName}=; Path=/; Max-Age=0; SameSite=Strict`,
];

const getTeamMembership = async (teamId: string, userId: string) =>
  await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
    },
    select: {
      role: true,
    },
  });

const requireTeamAdmin = async (teamId: string, userId: string) => {
  const membership = await getTeamMembership(teamId, userId);
  const isAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

  if (!isAdmin) {
    const error = new Error('Insufficient permissions');
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession(req, res);
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const teamId =
      typeof req.query.teamId === 'string'
        ? req.query.teamId
        : typeof req.body?.teamId === 'string'
          ? req.body.teamId
          : undefined;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    switch (req.method) {
      case 'GET': {
        const membership = await getTeamMembership(teamId, userId);

        if (!membership) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const connection = await prisma.fleetConnection.findUnique({
          where: { teamId },
        });

        return res.status(200).json({
          status: connection?.status ?? 'CONNECTED',
          disconnectedAt: connection?.disconnectedAt ?? null,
          deleteAfter: connection?.deleteAfter ?? null,
          deletedAt: connection?.deletedAt ?? null,
          cleanupError: connection?.cleanupError ?? null,
        });
      }

      case 'POST': {
        await requireTeamAdmin(teamId, userId);

        const action = req.body?.action;

        if (action === 'disconnect') {
          const now = new Date();
          const connection = await prisma.fleetConnection.upsert({
            where: { teamId },
            update: {
              status: 'DISCONNECTED',
              disconnectedAt: now,
              deleteAfter: addRetentionPeriod(now),
              deletedAt: null,
              disconnectedById: userId,
              cleanupError: null,
            },
            create: {
              teamId,
              status: 'DISCONNECTED',
              disconnectedAt: now,
              deleteAfter: addRetentionPeriod(now),
              disconnectedById: userId,
            },
          });

          res.setHeader('Set-Cookie', expireFleetCookies());
          return res.status(200).json({ success: true, connection });
        }

        if (action === 'reconnect') {
          const connection = await prisma.fleetConnection.upsert({
            where: { teamId },
            update: {
              status: 'CONNECTED',
              disconnectedAt: null,
              deleteAfter: null,
              deletedAt: null,
              disconnectedById: null,
              cleanupError: null,
            },
            create: {
              teamId,
              status: 'CONNECTED',
            },
          });

          return res.status(200).json({ success: true, connection });
        }

        return res.status(400).json({ error: 'Unsupported action' });
      }

      default:
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return res.status(status).json({ error: message });
  }
}
