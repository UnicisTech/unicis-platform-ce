import {
  addControlsToIssue,
  changeControlInIssue,
  removeControlsFromIssue,
} from '@/lib/csc';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ISO } from 'types';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return handlePUT(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { operation, controls, ISO } = req.body;

  if (operation === 'add') {
    await addControlsToIssue({
      user: teamMember.user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  if (operation === 'remove') {
    await removeControlsFromIssue({
      user: teamMember.user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  if (operation === 'change') {
    await changeControlInIssue({
      user: teamMember.user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
