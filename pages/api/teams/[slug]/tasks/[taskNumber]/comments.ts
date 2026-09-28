import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from 'models/comment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { sendEvent } from '@/lib/svix';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { NotificationType } from '@/generated/enums';
import { prisma } from '@/lib/prisma';
import { serializeForApi } from '@/lib/serialize';

const parsePositiveInteger = (value: string | string[] | undefined) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value) || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

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
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get task comments, optionally using cursor pagination
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const {
    slug,
    taskNumber,
    limit: limitQuery,
    cursor: cursorQuery,
  } = req.query;
  const taskNumberAsNumber = Number(taskNumber);
  const limit = parsePositiveInteger(limitQuery);
  const cursor = parsePositiveInteger(cursorQuery);

  if (
    !Number.isSafeInteger(taskNumberAsNumber) ||
    taskNumberAsNumber < 0 ||
    limit === null ||
    cursor === null ||
    (cursor !== undefined && limit === undefined) ||
    (limit !== undefined && limit > 100)
  ) {
    return res.status(400).json({
      data: null,
      error: { message: 'Invalid pagination or task parameters' },
    });
  }

  const page = await getTaskComments({
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    limit,
    cursor,
  });

  if (!page) {
    return res.status(404).json({
      data: null,
      error: { message: 'Task not found' },
    });
  }

  return res.status(200).json({
    data: serializeForApi(page),
    error: null,
  });
};

// Create a comment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'comment');

  const { slug, taskNumber } = req.query;
  const slugValue = slug as string;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const { text } = req.body;
  const sanitizedText = sanitizeRichText(typeof text === 'string' ? text : '');
  const userId = teamMember.user.id;

  const comment = await createComment({
    text: sanitizedText,
    taskNumber: taskNumberAsNumber,
    slug: slugValue,
    userId,
  });

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not created',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.commented', comment);

  const task = await prisma.task.findFirst({
    where: {
      taskNumber: taskNumberAsNumber,
      team: { slug: slugValue },
    },
    select: {
      id: true,
      title: true,
      taskNumber: true,
      teamId: true,
      team: { select: { slug: true, name: true } },
    },
  });

  if (task) {
    const recipients = await getTeamRecipientsBySlug(slugValue);
    await notificationService.sendBulk(
      recipients.map((user) => ({
        type: NotificationType.TASK_COMMENTED,
        title: `Team: ${task.team?.name ?? slugValue}\nNew comment on: #${task.taskNumber} - ${task.title}`,
        body: `${teamMember.user.name ?? 'Someone'} commented on a task.`,
        link: `/teams/${task.team?.slug ?? slugValue}/tasks/${task.taskNumber}`,
        recipientId: user.id,
        recipientEmail: user.email,
        teamId: task.teamId,
        metadata: {
          source: {
            taskId: task.id,
            taskNumber: task.taskNumber,
            event: 'task.commented',
            commentId: comment.id,
          },
        },
      }))
    );
  }

  return res.status(200).json({ data: comment, error: null });
};

// Edit a comment
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);
  const { text, id } = req.body;

  if (
    !Number.isSafeInteger(taskNumberAsNumber) ||
    taskNumberAsNumber < 0 ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return res.status(400).json({
      error: { message: 'Invalid task or comment number' },
    });
  }

  const sanitizedText = sanitizeRichText(typeof text === 'string' ? text : '');

  const comment = await updateComment({
    id,
    text: sanitizedText,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
  });

  if (!comment) {
    return res.status(404).json({
      error: {
        message: 'Comment not found',
      },
    });
  }

  return res.status(200).json({ data: comment, error: null });
};

// Delete a comment
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);
  const { id } = req.body;

  if (
    !Number.isSafeInteger(taskNumberAsNumber) ||
    taskNumberAsNumber < 0 ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return res.status(400).json({
      error: { message: 'Invalid task or comment number' },
    });
  }

  const comment = await deleteComment({
    id,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
  });

  if (!comment) {
    return res.status(404).json({
      error: {
        message: 'Comment not found',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
