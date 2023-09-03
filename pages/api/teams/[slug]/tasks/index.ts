import { sendEvent } from '@/lib/svix';
import { createTask, getTeamTasks } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    case 'GET':
      return handleGET(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get team tasks
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const tasks = await getTeamTasks(teamMember.team.slug as string);

  return res.status(200).json({ data: tasks, error: null });
};

// Create a task
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'create');

  const { title, status, duedate, description } = req.body;
  const {
    user: { id: authorId },
    teamId,
  } = teamMember;

  const task = await createTask({
    authorId,
    teamId,
    title,
    status,
    duedate,
    description,
  });

  await sendEvent(teamMember.teamId, 'task.created', task);

  return res.status(200).json({ data: {}, error: null });
};
