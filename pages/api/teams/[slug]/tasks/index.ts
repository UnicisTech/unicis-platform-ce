import { createTask, getTeamTasks } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { parseDueDateInput } from '@/lib/tasks/dueDate';
import { publishTaskCreated } from '@/lib/tasks/task-events';
import { serializeForApi } from '@/lib/serialize';
import { DEFAULT_TASK_PRIORITY, isTaskPriority } from '@/lib/tasks';

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

  return res.status(200).json({ data: serializeForApi(tasks), error: null });
};

// Create a task
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'create');

  const { title, status, duedate, description } = req.body;
  const priority = req.body.priority ?? DEFAULT_TASK_PRIORITY;
  const { value: dueAt, valid } = parseDueDateInput(duedate);

  if (!valid) {
    return res.status(400).json({
      error: { message: 'Invalid due date' },
    });
  }

  if (typeof priority !== 'string' || !isTaskPriority(priority)) {
    return res.status(400).json({
      error: { message: 'Invalid priority' },
    });
  }

  const sanitizedDescription = sanitizeRichText(
    typeof description === 'string' ? description : ''
  );
  const {
    user: { id: authorId },
    teamId,
  } = teamMember;

  const task = await createTask({
    authorId,
    teamId,
    title,
    status,
    priority,
    duedate: dueAt,
    description: sanitizedDescription,
  });

  await publishTaskCreated({
    actorName: teamMember.user.name,
    task,
    teamId: teamMember.teamId,
    teamSlug: teamMember.team.slug,
  });

  return res.status(200).json({ data: {}, error: null });
};
