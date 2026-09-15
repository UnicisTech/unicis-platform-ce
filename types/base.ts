import type { Team } from '@/generated/client';
import type { Prisma, TeamMember, User } from '@/generated/browser';
import type { TaskCscProperties, TeamCscProperties } from './csc';
import type { TaskTiaProperties } from './tia';
import type { TaskRpaProperties } from './rpa';
import type { TaskPiaProperties } from './pia';
import { TeamIapProperties } from './iap';
import type { TaskRmProperties } from './rm';
import type { Session } from 'next-auth';

export const componentStatuses = [
  'info',
  'success',
  'warning',
  'error',
] as const;
export type ComponentStatus = (typeof componentStatuses)[number];

export type ApiError = {
  code?: string;
  message: string;
  values: { [key: string]: string };
};

export type ApiResponse<T = unknown> =
  | {
      data: T;
      error: never;
    }
  | {
      data: never;
      error: ApiError;
    };

export type JoinApiResponse = ApiResponse<{
  user: User;
  confirmEmail: boolean;
  team: Team;
}>;

export type Role = 'owner' | 'member';

export type TeamWithMemberCount = Prisma.TeamGetPayload<{
  include: {
    _count: {
      select: { members: true };
    };
    subscription: true;
  };
}>;

export type TaskComment = Prisma.CommentGetPayload<{
  select: {
    id: true;
    text: true;
    createdAt: true;
    updatedAt: true;
    taskId: true;
    createdById: true;
    createdBy: {
      select: {
        id: true;
        name: true;
      };
    };
    reactions: {
      select: {
        id: true;
        emoji: true;
        commentId: true;
        userId: true;
        createdAt: true;
        user: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type CommentsPage = {
  items: TaskComment[];
  totalCount: number;
  pageInfo: {
    hasMore: boolean;
    nextCursor: number | null;
  };
};

export type LegacyTaskComment = Omit<TaskComment, 'createdBy'> & {
  createdBy: TaskComment['createdBy'] & { email: string };
};

export type TaskDetail = Prisma.TaskGetPayload<{
  include: {
    attachments: {
      select: {
        filename: true;
        url: true;
        taskId: true;
        id: true;
      };
    };
  };
}> & {
  comments?: LegacyTaskComment[];
};

/** @deprecated Use TaskDetail instead. */
export type TaskExtended = TaskDetail;

export type Attachment = {
  filename: string;
  id: string;
  taskId: number;
  url: string;
};

export type WebookFormSchema = {
  name: string;
  url: string;
  eventTypes: string[];
};

export type AppEvent =
  | 'invitation.created'
  | 'invitation.removed'
  | 'invitation.fetched'
  | 'member.created'
  | 'member.removed'
  | 'member.left'
  | 'member.fetched'
  | 'member.role.updated'
  | 'user.password.updated'
  | 'user.password.request'
  | 'user.updated'
  | 'user.signup'
  | 'user.password.reset'
  | 'user.fleet_password.reset'
  | 'team.fetched'
  | 'team.created'
  | 'team.updated'
  | 'team.removed'
  | 'apikey.created'
  | 'apikey.removed'
  | 'apikey.fetched'
  | 'apikey.removed'
  | 'webhook.created'
  | 'webhook.removed'
  | 'webhook.fetched'
  | 'webhook.updated'
  | 'task.created'
  | 'task.updated'
  | 'task.commented'
  | 'task.deleted'
  | 'task.due';

export type AUTH_PROVIDER =
  | 'github'
  | 'google'
  | 'saml'
  | 'email'
  | 'credentials';

export interface TeamFeature {
  sso: boolean;
  dsync: boolean;
  auditLog?: boolean;
  webhook?: boolean;
  apiKey?: boolean;
}

export type Option = {
  label: string;
  value: string;
};

export type Diff = {
  field: string;
  prevValue?: string | string[];
  nextValue: string | string[];
} | null;

export type AuditLog = {
  actor: Session['user'];
  date: number;
  event: string;
  diff: Diff;
};

export type TeamMemberWithUser = TeamMember & { user: User };

export type TeamProperties = TeamCscProperties & TeamIapProperties;

export type TaskAuditLogProperties = {
  task_audit_logs?: AuditLog[];
};

export type TaskProperties = TaskTiaProperties &
  TaskCscProperties &
  TaskRpaProperties &
  TaskPiaProperties &
  TaskRmProperties &
  TaskAuditLogProperties;

/** @deprecated Use TaskComment instead. */
export type ExtendedComment = TaskComment;

export type TeamWithSubscription = Prisma.TeamGetPayload<{
  include: {
    subscription: true;
  };
}>;

export type SubscriptionWithPayments = Prisma.SubscriptionGetPayload<{
  include: {
    payments: true;
  };
}>;

export type UserReturned = Pick<User, 'name' | 'firstName' | 'lastName'>;

export type ChatbotResponse = {
  content: string;
  role: string;
};
export type ChatbotResponseReturned = {
  response: ChatbotResponse;
};
