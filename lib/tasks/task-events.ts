import type { Task } from '@/generated/client';
import { NotificationType } from '@/generated/enums';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { sendEvent } from '@/lib/svix';

export const publishTaskCreated = async ({
  actorName,
  task,
  teamId,
  teamSlug,
  teamName,
}: {
  actorName?: string | null;
  task: Pick<Task, 'id' | 'taskNumber' | 'title'> & Partial<Task>;
  teamId: string;
  teamSlug: string;
  teamName: string;
}) => {
  await sendEvent(teamId, 'task.created', task as Record<string, unknown>);

  const recipients = await getTeamRecipientsBySlug(teamSlug);
  await notificationService.sendBulk(
    recipients.map((user) => ({
      type: NotificationType.TASK_CREATED,
      title: `Team: ${teamName}\nTask created: #${task.taskNumber} - ${task.title}`,
      body: `${actorName ?? 'Someone'} created a task.`,
      link: `/teams/${teamSlug}/tasks/${task.taskNumber}`,
      recipientId: user.id,
      recipientEmail: user.email,
      teamId,
      metadata: {
        source: {
          taskId: task.id,
          taskNumber: task.taskNumber,
          event: 'task.created',
        },
      },
    }))
  );
};
