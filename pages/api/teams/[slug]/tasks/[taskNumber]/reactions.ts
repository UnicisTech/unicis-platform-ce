import { toggleReaction } from 'models/commentReaction';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { notificationService } from '@/lib/notifications/notification-service';
import { NotificationType } from '@/generated/enums';
import { prisma } from '@/lib/prisma';

const ALLOWED_EMOJIS = [
  '\u{1F44D}',
  '\u{1F44E}',
  '\u{1F604}',
  '\u{1F389}',
  '\u{1F615}',
  '\u{2764}\u{FE0F}',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      data: null,
      error: { message: `Method ${method} Not Allowed` },
    });
  }

  return handlePOST(req, res);
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const { slug, taskNumber } = req.query;
  const slugValue = slug as string;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: { message: 'Invalid task number' },
    });
  }

  const { commentId, emoji } = req.body;

  if (!commentId || typeof commentId !== 'number') {
    return res.status(400).json({
      error: { message: 'commentId must be a valid number' },
    });
  }

  if (!emoji || typeof emoji !== 'string') {
    return res.status(400).json({
      error: { message: 'emoji is required' },
    });
  }

  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return res.status(400).json({
      error: { message: 'Invalid emoji' },
    });
  }

  // Verify the comment belongs to a task in this team
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      task: {
        taskNumber: taskNumberAsNumber,
        team: { slug: slugValue },
      },
    },
    select: {
      id: true,
      createdById: true,
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          taskNumber: true,
          teamId: true,
          team: { select: { slug: true, name: true } },
        },
      },
    },
  });

  if (!comment) {
    return res.status(404).json({
      error: { message: 'Comment not found' },
    });
  }

  const result = await toggleReaction({
    commentId,
    userId: teamMember.user.id,
    emoji,
  });

  // Send notification only when a reaction is added (not removed)
  // and only to the comment author (not to the person who reacted)
  if (
    result.action === 'added' &&
    comment.createdById !== teamMember.user.id
  ) {
    const { task } = comment;

    await notificationService.sendBulk([
      {
        type: NotificationType.COMMENT_REACTED,
        title: `Team: ${task.team?.name ?? slugValue}\nReaction on your comment: #${task.taskNumber} - ${task.title}`,
        body: `${teamMember.user.name ?? 'Someone'} reacted ${emoji} to your comment.`,
        link: `/teams/${task.team?.slug ?? slugValue}/tasks/${task.taskNumber}`,
        recipientId: comment.createdBy.id,
        recipientEmail: comment.createdBy.email,
        teamId: task.teamId,
        metadata: {
          source: {
            taskId: task.id,
            taskNumber: task.taskNumber,
            event: 'comment.reacted',
            commentId,
          },
        },
      },
    ]);
  }

  return res.status(200).json({ data: result, error: null });
};
