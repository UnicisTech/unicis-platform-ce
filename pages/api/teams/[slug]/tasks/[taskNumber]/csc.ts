import {
  addControlsToIssue,
  changeControlInIssue,
  removeControlsFromIssue,
} from 'models/csc';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { validateApiRequestBody } from '@/lib/api-validation';
import { cscControlsWriteRequestSchema } from '@/lib/properties';

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

  const body = validateApiRequestBody(
    cscControlsWriteRequestSchema,
    req.body,
    res
  );

  if (!body) {
    return;
  }

  const { operation, controls, ISO } = body;
  const params = {
    user: teamMember.user,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    controls,
    ISO,
  };

  switch (operation) {
    case 'add':
      await addControlsToIssue(params);
      break;
    case 'remove':
      await removeControlsFromIssue(params);
      break;
    case 'change':
      await changeControlInIssue(params);
      break;
  }

  return res.status(200).json({ data: {}, error: null });
};
