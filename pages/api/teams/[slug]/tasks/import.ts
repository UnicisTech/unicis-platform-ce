import { createTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { DEFAULT_TASK_PRIORITY, isTaskPriority, statuses } from '@/lib/tasks';
import { parseDueDateInput } from '@/lib/tasks/dueDate';

interface ImportTaskRow {
  title: string;
  status: string;
  priority?: string;
  duedate?: string;
  description?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Bulk import tasks
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'create');

  const { tasks } = req.body as { tasks: ImportTaskRow[] };

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      data: null,
      error: { message: 'No tasks provided.' },
    });
  }

  const {
    user: { id: authorId },
    teamId,
  } = teamMember;

  const validStatuses = [...statuses, 'failed'];
  const errors: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const row = tasks[i];
    if (!row.title?.trim()) {
      errors.push(`Row ${i + 1}: title is required`);
    }
    if (!validStatuses.includes(row.status)) {
      errors.push(`Row ${i + 1}: invalid status "${row.status}"`);
    }
    const priority =
      row.priority?.trim().toLowerCase() || DEFAULT_TASK_PRIORITY;
    if (!isTaskPriority(priority)) {
      errors.push(`Row ${i + 1}: invalid priority "${priority}"`);
    }
    if (row.duedate && isNaN(Date.parse(row.duedate))) {
      errors.push(`Row ${i + 1}: invalid date "${row.duedate}"`);
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      data: null,
      error: { message: errors.join('; ') },
    });
  }

  let count = 0;
  for (const row of tasks) {
    const { value: dueAt } = parseDueDateInput(row.duedate ?? '');
    const rawPriority =
      row.priority?.trim().toLowerCase() || DEFAULT_TASK_PRIORITY;
    const priority = isTaskPriority(rawPriority)
      ? rawPriority
      : DEFAULT_TASK_PRIORITY;

    await createTask({
      authorId,
      teamId,
      title: row.title.trim(),
      status: row.status,
      priority,
      duedate: dueAt,
      description: row.description?.trim() || '',
    });
    count++;
  }

  return res.status(200).json({ data: { count }, error: null });
};
