import type { Task } from 'graphile-worker';

import { NotificationType } from '@/generated/client';
import { notificationService } from '@/lib/notifications/notification-service';
import { prisma } from '@/lib/prisma';
import { sendEvent } from '@/lib/svix';

const CLOSED_STATUSES = ['done', 'failed'];

const getUtcDayRange = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return { start, end };
};

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const taskDueCheck: Task = async () => {
  const { start, end } = getUtcDayRange();
  const dateKey = getDateKey(start);

  const tasks = await prisma.task.findMany({
    where: {
      duedate: {
        gte: start,
        lte: end,
      },
      status: {
        notIn: CLOSED_STATUSES,
      },
    },
    select: {
      id: true,
      taskNumber: true,
      title: true,
      duedate: true,
      status: true,
      teamId: true,
      team: {
        select: {
          slug: true,
          name: true,
          members: {
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const task of tasks) {
    const team = task.team;
    if (!team) continue;

    const dueDateKey = task.duedate ? getDateKey(task.duedate) : dateKey;
    const link = `/teams/${team.slug}/tasks/${task.taskNumber}`;

    await sendEvent(task.teamId, 'task.due', {
      taskId: task.id,
      taskNumber: task.taskNumber,
      title: task.title,
      status: task.status,
      duedate: task.duedate,
      teamId: task.teamId,
      teamSlug: team.slug,
    });

    const recipients = new Map<
      string,
      { id: string; email: string; name: string }
    >();

    for (const member of team.members) {
      if (member.user) {
        recipients.set(member.user.id, member.user);
      }
    }

    await notificationService.sendBulk(
      Array.from(recipients.values()).map((user) => ({
        type: NotificationType.TASK_DUE,
        title: `Team: ${team.name}\nTask due today: #${task.taskNumber} - ${task.title}`,
        body: `Due date is ${dueDateKey} (UTC).`,
        link,
        recipientId: user.id,
        recipientEmail: user.email,
        teamId: task.teamId,
        dedupeKey: `task_due|task:${task.id}|user:${user.id}|date:${dueDateKey}`,
        metadata: {
          source: {
            taskId: task.id,
            dueDate: dueDateKey,
            event: 'task.due',
          },
        },
      }))
    );
  }
};
