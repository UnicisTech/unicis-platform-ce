import { getSession } from '@/lib/session';
import { createTask, deleteTask, getTasks, updateTask } from 'models/task';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEvent } from '@/lib/svix';
import { throwIfNoTeamAccess } from 'models/team';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    case 'PUT':
      return handlePUT(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Create a task
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, status, duedate, description, teamId } = req.body;
  const teamMember = await throwIfNoTeamAccess(req, res);

  //todo:   throwIfNotAllowed(teamMember, 'team_webhook', 'delete');

  const session = await getSession(req, res);
  const task = await createTask({
    authorId: session?.user?.id as string,
    teamId,
    title,
    status,
    duedate,
    description,
  });

  await sendEvent(teamMember.teamId, 'task.created', task);

  return res.status(200).json({ data: {}, error: null });
};

// Edit a task

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { taskId, data } = req.body;
  const session = await getSession(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const task = await updateTask(taskId, data);

  await sendEvent(teamMember.teamId, 'task.updated', task);

  return res.status(200).json({ data: task, error: null });
};

// Get tasks for user
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tasks = await getTasks(userId);

  return res.status(200).json({ data: tasks, error: null });
};

// Delete the task
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { taskId } = req.body;
  const session = await getSession(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const task = await deleteTask(taskId);

  await sendEvent(teamMember.teamId, 'task.deleted', task);

  return res.status(200).json({ data: {}, error: null });
};
