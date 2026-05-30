import { statuses } from '@/lib/tasks';
import { serializeForApi } from '@/lib/serialize';
import {
  addTaskAuditLogs,
  reorderTeamTasks,
  type TaskReorderInput,
} from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { NotificationType } from '@/generated/enums';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { TaskProperties } from 'types';

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

  const { slug } = req.query;
  const slugValue = slug as string;

  const { tasks, errors } = parseReorderTasks(req.body?.tasks);

  if (errors.length > 0) {
    return res.status(422).json({
      data: null,
      error: { message: errors.join('; ') },
    });
  }

  // Fetch current task data before reordering to detect status changes
  const taskNumbers = tasks.map((t) => t.taskNumber);
  const previousTasks = await prisma.task.findMany({
    where: {
      teamId: teamMember.teamId,
      taskNumber: { in: taskNumbers },
    },
    select: {
      id: true,
      taskNumber: true,
      title: true,
      status: true,
      duedate: true,
      description: true,
      properties: true,
    },
  });

  const previousStatusMap = new Map(
    previousTasks.map((t) => [t.taskNumber, t])
  );

  const updatedTasks = await reorderTeamTasks(teamMember.teamId, tasks);

  if (!updatedTasks) {
    return res.status(404).json({
      data: null,
      error: { message: 'One or more tasks were not found.' },
    });
  }

  // Find tasks whose status changed and send notifications
  const statusChangedTasks = tasks.filter((t) => {
    const prev = previousStatusMap.get(t.taskNumber);
    return prev && prev.status !== t.status;
  });

  if (statusChangedTasks.length > 0) {
    // Log audit entries for each status-changed task
    for (const t of statusChangedTasks) {
      const prev = previousStatusMap.get(t.taskNumber);
      if (!prev) continue;

      await addTaskAuditLogs({
        taskId: prev.id,
        user: teamMember.user,
        prevTask: {
          title: prev.title,
          status: prev.status,
          duedate: prev.duedate,
          description: prev.description,
        },
        nextTask: {
          title: prev.title,
          status: t.status,
          duedate: prev.duedate,
          description: prev.description,
        },
        taskProperties: ((prev.properties as TaskProperties) ||
          {}) as TaskProperties,
      });
    }

    // Send notifications
    const recipients = await getTeamRecipientsBySlug(slugValue);

    const notifications = statusChangedTasks.flatMap((t) => {
      const prev = previousStatusMap.get(t.taskNumber);
      if (!prev) return [];

      return recipients.map((user) => ({
        type: NotificationType.TASK_UPDATED,
        title: `Team: ${teamMember.team.name}\nTask status changed: #${t.taskNumber} - ${prev.title}`,
        body: `${teamMember.user.name ?? 'Someone'} moved task from ${prev.status} to ${t.status}.`,
        link: `/teams/${teamMember.team.slug}/tasks/${t.taskNumber}`,
        recipientId: user.id,
        recipientEmail: user.email,
        teamId: teamMember.teamId,
        metadata: {
          source: {
            taskId: prev.id,
            taskNumber: t.taskNumber,
            event: 'task.status_changed',
            previousStatus: prev.status,
            newStatus: t.status,
          },
        },
      }));
    });

    if (notifications.length > 0) {
      await notificationService.sendBulk(notifications);
    }
  }

  return res.status(200).json({
    data: serializeForApi(updatedTasks),
    error: null,
  });
};
