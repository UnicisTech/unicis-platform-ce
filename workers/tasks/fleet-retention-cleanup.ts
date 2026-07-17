import type { Task } from 'graphile-worker';

import { prisma } from '@/lib/prisma';

const MAX_TEAMS_PER_RUN = 25;

const deleteFleetTeamData = async (teamId: string) => {
  const fleetBase = process.env.FLEET_API_URL;
  const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

  if (!fleetBase || !fleetServiceToken) {
    throw new Error('Fleet API is not configured');
  }

  const response = await fetch(
    `${fleetBase.replace(/\/+$/, '')}/api/v1/team/${teamId}/service/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fleetServiceToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const error = await response.text().catch(() => '');
    throw new Error(
      `Fleet team delete failed with ${response.status}: ${error}`
    );
  }
};

export const fleetRetentionCleanup: Task = async () => {
  const now = new Date();

  const connections = await prisma.fleetConnection.findMany({
    where: {
      status: 'DISCONNECTED',
      deleteAfter: {
        lte: now,
      },
    },
    orderBy: {
      deleteAfter: 'asc',
    },
    take: MAX_TEAMS_PER_RUN,
  });

  for (const connection of connections) {
    await prisma.fleetConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        lastCleanupAttemptAt: now,
        cleanupError: null,
      },
    });

    try {
      await deleteFleetTeamData(connection.teamId);

      await prisma.$transaction([
        prisma.fleetEnrollment.deleteMany({
          where: {
            teamId: connection.teamId,
          },
        }),
        prisma.fleetConnection.update({
          where: {
            id: connection.id,
          },
          data: {
            status: 'DELETED',
            deletedAt: new Date(),
            cleanupError: null,
          },
        }),
      ]);
    } catch (error) {
      await prisma.fleetConnection.update({
        where: {
          id: connection.id,
        },
        data: {
          cleanupError:
            error instanceof Error ? error.message : 'Unknown cleanup error',
        },
      });
    }
  }
};
