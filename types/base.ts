import type { Prisma, TeamMember, User } from '@prisma/client';

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

export type Option = {
  label: string;
  value: number;
};

export type TeamMemberWithUser = TeamMember & { user: User };
