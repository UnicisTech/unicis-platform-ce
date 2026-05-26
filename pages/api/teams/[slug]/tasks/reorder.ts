import { statuses } from '@/lib/tasks';
import { serializeForApi } from '@/lib/serialize';
import { reorderTeamTasks, type TaskReorderInput } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

const validStatuses = new Set<string>(statuses);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const parseReorderTasks = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) {
    return {
      tasks: [],
      errors: ['Tasks payload is required.'],
    };
  }

  const tasks: TaskReorderInput[] = [];
  const taskNumbers = new Set<number>();
  const statusOrders = new Set<string>();
  const errors: string[] = [];

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`Item ${index + 1}: invalid task payload`);
      return;
    }

    const taskNumber = item.taskNumber;
    const status = item.status;
    const kanbanOrder = item.kanbanOrder;

    if (!isPositiveInteger(taskNumber)) {
      errors.push(`Item ${index + 1}: invalid task number`);
    }

    if (typeof status !== 'string' || !validStatuses.has(status)) {
      errors.push(`Item ${index + 1}: invalid status`);
    }

    if (!isNonNegativeInteger(kanbanOrder)) {
      errors.push(`Item ${index + 1}: invalid kanban order`);
    }

    if (
      !isPositiveInteger(taskNumber) ||
      typeof status !== 'string' ||
      !validStatuses.has(status) ||
      !isNonNegativeInteger(kanbanOrder)
    ) {
      return;
    }

    if (taskNumbers.has(taskNumber)) {
      errors.push(`Item ${index + 1}: duplicate task number`);
      return;
    }

    const statusOrderKey = `${status}:${kanbanOrder}`;
    if (statusOrders.has(statusOrderKey)) {
      errors.push(`Item ${index + 1}: duplicate order in status "${status}"`);
      return;
    }

    taskNumbers.add(taskNumber);
    statusOrders.add(statusOrderKey);
    tasks.push({ taskNumber, status, kanbanOrder });
  });

  return { tasks, errors };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return handlePUT(req, res);
    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { tasks, errors } = parseReorderTasks(req.body?.tasks);

  if (errors.length > 0) {
    return res.status(422).json({
      data: null,
      error: { message: errors.join('; ') },
    });
  }

  const updatedTasks = await reorderTeamTasks(teamMember.teamId, tasks);

  if (!updatedTasks) {
    return res.status(404).json({
      data: null,
      error: { message: 'One or more tasks were not found.' },
    });
  }

  return res.status(200).json({
    data: serializeForApi(updatedTasks),
    error: null,
  });
};
