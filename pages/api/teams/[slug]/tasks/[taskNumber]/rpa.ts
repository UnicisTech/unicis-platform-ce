import { deleteProcedure, saveProcedure } from '@/lib/rpa';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

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

  const { prevProcedure, nextProcedure } = req.body;

  const task = await saveProcedure({
    user: teamMember.user,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    prevProcedure,
    nextProcedure,
  });

  if (!task) {
    console.log('no task after saveprocedure');
    return res.status(400).json({
      error: {
        message: 'Something went wrong!',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
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

  const task = await deleteProcedure({
    user: teamMember.user,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    prevProcedure: [],
    nextProcedure: [],
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
