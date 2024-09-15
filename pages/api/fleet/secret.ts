import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const { fleetTeamId, secret, teamId } = req.body as {
    fleetTeamId: string;
    secret: string;
    teamId: string;
  };

  const team = await prisma.team.findFirstOrThrow({
    where: { id: teamId },
  });

  await prisma.team.update({
    where: { id: teamId },
    data: { fleetSecret: secret, fleetTeamId: fleetTeamId },
  });

  res.status(200).json({ data: team });
};