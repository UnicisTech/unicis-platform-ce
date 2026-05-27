import { ApiError } from '@/lib/errors';
import { serializeForApi } from '@/lib/serialize';
import {
  createTaskRecurrence,
  getTeamTaskRecurrences,
  parseCreateTaskRecurrenceInput,
} from 'models/taskRecurrence';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGET(req, res);
      case 'POST':
        return await handlePOST(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          data: null,
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return res.status(status).json({
      data: null,
      error: { message },
    });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const includeArchived = req.query.includeArchived === 'true';
  const recurrences = await getTeamTaskRecurrences(
    teamMember.teamId,
    includeArchived
  );

  return res.status(200).json({
    data: serializeForApi(recurrences),
    error: null,
  });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'create');

  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'Invalid request body');
  }

  const data = parseCreateTaskRecurrenceInput(req.body);
  const recurrence = await createTaskRecurrence({
    ...data,
    authorId: teamMember.user.id,
    teamId: teamMember.teamId,
  });

  return res.status(200).json({
    data: serializeForApi(recurrence),
    error: null,
  });
};
