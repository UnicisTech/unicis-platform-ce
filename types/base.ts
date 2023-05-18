import type { Prisma, TeamMember, User } from "@prisma/client";
import type { Session } from "next-auth";

export type ApiError = {
  code?: string;
  message: string;
  values: { [key: string]: string };
};

export type ApiResponse<T = unknown> = {
  data: T | null;
  error: ApiError | null;
};

export type Role = "owner" | "member";

export type SPSAMLConfig = {
  issuer: string;
  acs: string;
};

export type TeamWithMemberCount = Prisma.TeamGetPayload<{
  include: {
    _count: {
      select: { members: true };
    };
  };
}>;

export type TaskWithComments = Prisma.TaskGetPayload<{
  include: {
    comments: {
      include: {
        createdBy: true;
      };
    };
  };
}>;

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
