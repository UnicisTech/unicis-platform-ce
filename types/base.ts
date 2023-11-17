import type { Prisma, TeamMember, User } from '@prisma/client';
import type { TaskCscProperties, TeamCscProperties } from './csc';
import type { TaskTiaProperties } from './tia';
import type { TaskRpaProperties } from './rpa';

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

export type Role = 'owner' | 'member';

export type TeamWithMemberCount = Prisma.TeamGetPayload<{
  include: {
    _count: {
      select: { members: true };
    };
  };
}>;

export type TaskExtended = Prisma.TaskGetPayload<{
  include: {
    comments: {
      include: {
        createdBy: true;
      };
    };
    attachments: true;
  };
}>;

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
  | 'task.deleted';

export type AUTH_PROVIDER =
  | 'github'
  | 'google'
  | 'saml'
  | 'email'
  | 'credentials';

export interface TeamFeature {
  sso: boolean;
  dsync: boolean;
  auditLog: boolean;
  webhook: boolean;
  apiKey: boolean;
}

export type Option = {
  label: string;
  value: number;
};

export type Diff = {
  field: string;
  prevValue: string | string[] | undefined;
  nextValue: string | string[];
} | null;

export type TeamMemberWithUser = TeamMember & { user: User };

export type TeamProperties = TeamCscProperties

export type TaskProperties = TaskTiaProperties & TaskCscProperties & TaskRpaProperties

// export type TeamProperties = {
//   csc_iso?: ISO;
//   [key in CscStatusesProp | CscControlsProp]?: string;
// };