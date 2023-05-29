import type { Session } from "next-auth";

export type CscOption = {
  label: string;
  value: number;
};

export type CscAuditLog = {
  actor: Session["user"];
  date: number;
  event: string;
  diff: {
    prevValue: string | null;
    nextValue: string;
  };
};
