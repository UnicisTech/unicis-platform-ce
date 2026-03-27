import type { Notification as PrismaNotification } from '@/generated/browser';
import type { Serialized } from './dto';

export type NotificationDto = Serialized<PrismaNotification>;

export type NotificationListResponse = {
  notifications: NotificationDto[];
  total: number;
  unreadCount: number;
  page: number;
};
