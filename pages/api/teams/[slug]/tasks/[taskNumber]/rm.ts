import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { deleteRisk, saveRisk } from 'models/rm';
import {
  calculateRiskRating,
  getRiskLevelBucket,
} from '@/lib/rm/helpers';
import { trackServerEvent } from '@/lib/matomo/server';
import { MatomoEvent } from '@/lib/matomo/events';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { slug, taskNumber } = req.query;

  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const { prevRisk, nextRisk } = req.body;

  const task = await saveRisk({
    user: teamMember.user,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    prevRisk,
    nextRisk,
  });

  if (!task) {
    return res.status(400).json({
      error: {
        message: 'Something went wrong!',
      },
    });
  }

  if (nextRisk?.length && nextRisk[0]) {
    const bucket = getRiskLevelBucket(
      calculateRiskRating(nextRisk[0].RawProbability, nextRisk[0].RawImpact)
    );
    const isNewRisk = !prevRisk?.length;
    trackServerEvent(
      isNewRisk ? MatomoEvent.RiskCreated : MatomoEvent.RiskScored,
      bucket
    );
  }

  return res.status(200).json({ data: { task }, error: null });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { slug, taskNumber } = req.query;

  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const task = await deleteRisk({
    user: teamMember.user,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    prevRisk: [],
    nextRisk: [],
  });

  if (!task) {
    return res.status(400).json({
      error: {
        message: 'Something went wrong!',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
