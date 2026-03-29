import { NotificationType } from '@/generated/enums';

export type ChannelPrefs = {
  inApp: boolean;
  email: boolean;
  push: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Record<
  NotificationType,
  ChannelPrefs
> = {
  TASK_DUE: { inApp: true, email: false, push: false },
  TASK_CREATED: { inApp: true, email: false, push: false },
  TASK_UPDATED: { inApp: true, email: false, push: false },
  TASK_COMMENTED: { inApp: true, email: false, push: false },
  TASK_DELETED: { inApp: true, email: false, push: false },
  FILE_UPLOADED: { inApp: true, email: false, push: false },
};

export const NOTIFICATION_TYPES = [
  { type: NotificationType.TASK_DUE, labelKey: 'notifications.types.task-due' },
  {
    type: NotificationType.TASK_CREATED,
    labelKey: 'notifications.types.task-created',
  },
  {
    type: NotificationType.TASK_UPDATED,
    labelKey: 'notifications.types.task-updated',
  },
  {
    type: NotificationType.TASK_COMMENTED,
    labelKey: 'notifications.types.task-commented',
  },
  {
    type: NotificationType.TASK_DELETED,
    labelKey: 'notifications.types.task-deleted',
  },
  {
    type: NotificationType.FILE_UPLOADED,
    labelKey: 'notifications.types.file-uploaded',
  },
] as const;
