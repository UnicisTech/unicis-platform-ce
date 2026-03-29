import { sendEvent } from '@/lib/svix';
import { createTask, getTeamTasks } from 'models/task';
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
  const { value: dueAt, valid } = parseDueDateInput(duedate);

  if (!valid) {
    return res.status(400).json({
      error: { message: 'Invalid due date' },
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
    duedate: dueAt,
    description: sanitizedDescription,
  });

  await sendEvent(teamMember.teamId, 'task.created', task);

  const recipients = await getTeamRecipientsBySlug(teamMember.team.slug);
  await notificationService.sendBulk(
    recipients.map((user) => ({
      type: NotificationType.TASK_CREATED,
      title: `Task created: \"${task.title}\"`,
      body: `${teamMember.user.name ?? 'Someone'} created a task.`,
      link: `/teams/${teamMember.team.slug}/tasks/${task.taskNumber}`,
      recipientId: user.id,
      recipientEmail: user.email,
      teamId: teamMember.teamId,
      metadata: {
        source: {
          taskId: task.id,
          taskNumber: task.taskNumber,
          event: 'task.created',
        },
      },
    }))
  );

  return res.status(200).json({ data: {}, error: null });
};
