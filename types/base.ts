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

export type AuditLog = {
  actor: Session["user"];
  date: number;
  event: string;
  diff: {
    prevValue: string | null;
    nextValue: string;
  };
};

export type TeamMemberWithUser = TeamMember & { user: User };

type RpaOption = {
  label: string;
  value: string;
};

export type RpaProcedureInterface = [
  {
    reviewDate: string;
    controller: string;
    dpo: RpaOption;
  },
  {
    purpose?: string;
    category: RpaOption[];
    datasubject: RpaOption[];
    retentionperiod: RpaOption;
    specialcategory: RpaOption[];
    commentsretention?: string;
  },
  {
    recipientType: RpaOption;
    recipientdetails?: string;
  },
  {
    datatransfer: boolean;
    recipient: string;
    country: RpaOption;
    guarantee: RpaOption[];
  },
  {
    toms: RpaOption[];
  }
];
