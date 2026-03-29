import { createComment, updateComment, deleteComment } from 'models/comment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { sendEvent } from '@/lib/svix';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { NotificationType } from '@/generated/enums';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
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

// Create a comment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

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
      team: { select: { slug: true } },
    },
  });

  if (task) {
    const recipients = await getTeamRecipientsBySlug(slugValue);
    await notificationService.sendBulk(
      recipients.map((user) => ({
        type: NotificationType.TASK_COMMENTED,
        title: `New comment on: \"${task.title}\"`,
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

  const { text, id } = req.body;
  const sanitizedText = sanitizeRichText(typeof text === 'string' ? text : '');

  const comment = await updateComment(id, sanitizedText);

  if (!comment) {
    return res.status(503).json({
      error: {
        message: 'Comment is not updated.',
      },
    });
  }

  return res.status(200).json({ data: comment, error: null });
};

// Delete a comment
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { id } = req.body;

  const comment = await deleteComment(id);

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not deleted',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
