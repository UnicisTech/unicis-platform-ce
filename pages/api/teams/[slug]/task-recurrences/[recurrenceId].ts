import { serializeForApi } from '@/lib/serialize';
import { ApiError } from '@/lib/errors';
import {
  archiveTaskRecurrence,
  parseUpdateTaskRecurrenceInput,
  updateTaskRecurrence,
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
      case 'PUT':
        return await handlePUT(req, res);
      case 'DELETE':
        return await handleDELETE(req, res);
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
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

const getRecurrenceId = (req: NextApiRequest) => {
  const { recurrenceId } = req.query;
  return Array.isArray(recurrenceId) ? recurrenceId[0] : recurrenceId;
};

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'Invalid request body');
  }

  const recurrenceId = getRecurrenceId(req);
  if (!recurrenceId) {
    return res.status(400).json({
      data: null,
      error: { message: 'Invalid recurrence id' },
    });
  }

  const data = parseUpdateTaskRecurrenceInput(req.body ?? {});
  const recurrence = await updateTaskRecurrence({
    data,
    id: recurrenceId,
    teamId: teamMember.teamId,
  });

  if (!recurrence) {
    return res.status(404).json({
      data: null,
      error: { message: 'Task recurrence not found' },
    });
  }

  return res.status(200).json({
    data: serializeForApi(recurrence),
    error: null,
  });
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'delete');

  const recurrenceId = getRecurrenceId(req);
  if (!recurrenceId) {
    return res.status(400).json({
      data: null,
      error: { message: 'Invalid recurrence id' },
    });
  }

  const recurrence = await archiveTaskRecurrence(
    teamMember.teamId,
    recurrenceId
  );

  if (!recurrence) {
    return res.status(404).json({
      data: null,
      error: { message: 'Task recurrence not found' },
    });
  }

  return res.status(200).json({
    data: serializeForApi(recurrence),
    error: null,
  });
};
