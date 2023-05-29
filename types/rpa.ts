import type { Session } from "next-auth";
import type { Task } from "@prisma/client";

export type RpaOption = {
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

export interface RpaConfig {
  category: RpaOption[];
  specialcategory: RpaOption[];
  datasubject: RpaOption[];
  retentionperiod: RpaOption[];
  recipientType: RpaOption[];
  guarantee: RpaOption[];
  toms: RpaOption[];
  country: RpaOption[];
}

export type RpaAuditLog = {
  actor: Session["user"];
  date: number;
  event: string;
  diff: {
    prevValue: string | string[] | undefined;
    nextValue: string | string[];
  } | null;
};

export type TaskWithRpaProcedure = Task & {
  properties: {
    rpa_procedure: RpaProcedureInterface;
  };
};
