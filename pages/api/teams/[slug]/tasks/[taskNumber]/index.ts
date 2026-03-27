import { sendEvent } from '@/lib/svix';
import { getTaskBySlugAndNumber, updateTask, deleteTask } from 'models/task';
import { throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNotAllowed } from 'models/user';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { parseDueDateInput } from '@/lib/tasks/dueDate';
import { serializeForApi } from '@/lib/serialize';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { NotificationType } from '@/generated/enums';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    case 'PUT':
      return handlePUT(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get task by slug and taskNumber
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const task = await getTaskBySlugAndNumber(taskNumberAsNumber, slug as string);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  return res.status(200).json({ data: serializeForApi(task), error: null });
};

// Edit a task
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

  const { data } = req.body;
  const sanitizedData = { ...data };

  if (typeof sanitizedData.description === 'string') {
    sanitizedData.description = sanitizeRichText(sanitizedData.description);
  }

  if (Object.prototype.hasOwnProperty.call(sanitizedData, 'duedate')) {
    const { value: dueAt, valid } = parseDueDateInput(sanitizedData.duedate);
    if (!valid) {
      return res.status(400).json({
        error: {
          message: 'Invalid due date',
        },
      });
    }
    sanitizedData.duedate = dueAt;
  }

  const task = await updateTask(
    taskNumberAsNumber,
    slug as string,
    sanitizedData
  );

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.updated', task);

  const recipients = await getTeamRecipientsBySlug(slug as string);
  await notificationService.sendBulk(
    recipients.map((user) => ({
      type: NotificationType.TASK_UPDATED,
      title: `Task updated: \"${task.title}\"`,
      body: `${teamMember.user.name ?? 'Someone'} updated a task.`,
      link: `/teams/${teamMember.team.slug}/tasks/${task.taskNumber}`,
      recipientId: user.id,
      recipientEmail: user.email,
      teamId: teamMember.teamId,
      metadata: {
        source: {
          taskId: task.id,
          taskNumber: task.taskNumber,
          event: 'task.updated',
        },
      },
    }))
  );

  return res.status(200).json({ data: serializeForApi(task), error: null });
};

// Delete the task
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'delete');

  const { slug, taskNumber } = req.query;

  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const task = await deleteTask(taskNumberAsNumber, slug as string);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.deleted', task);

  const recipients = await getTeamRecipientsBySlug(slug as string);
  await notificationService.sendBulk(
    recipients.map((user) => ({
      type: NotificationType.TASK_DELETED,
      title: `Task deleted: \"${task.title}\"`,
      body: `${teamMember.user.name ?? 'Someone'} deleted a task.`,
      link: `/teams/${teamMember.team.slug}/tasks`,
      recipientId: user.id,
      recipientEmail: user.email,
      teamId: teamMember.teamId,
      metadata: {
        source: {
          taskId: task.id,
          taskNumber: task.taskNumber,
          event: 'task.deleted',
        },
      },
    }))
  );

  return res.status(200).json({ data: {}, error: null });
};
