import type { Dispatch, SetStateAction } from 'react';
import type { Task } from '@prisma/client';
import type { Session } from 'next-auth';
import type { Diff } from './base';

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
  },
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
  involveProfiling: RpaOption[];
  useAutomated: RpaOption[];
  involveSurveillance: RpaOption[];
  processedSpecialCategories: RpaOption[];
  isBigData: RpaOption[];
  dataSetsCombined: RpaOption[];
  multipleControllers: RpaOption[];
  imbalanceInRelationship: RpaOption[];
  innovativeTechnologyUsed: RpaOption[];
  transferredOutside: RpaOption[];
  rightsRestricted: RpaOption[];
  piaNeeded: RpaOption[];
}

//TODO: RpaAuditLog and TiaAuditLog, use AuditLog from base.ts instead
export type RpaAuditLog = {
  actor: Session['user'];
  date: number;
  event: string;
  diff: Diff;
};

export type TaskWithRpaProcedure = Task & {
  properties: {
    rpa_procedure: RpaProcedureInterface;
  };
};

export type TaskRpaProperties = {
  rpa_procedure?: RpaProcedureInterface | [];
  rpa_audit_logs: RpaAuditLog[];
};

export type ProcedureQueueItem = 'TIA' | 'PIA';

export interface UseRpaCreationState {
  selectedTask: Task | undefined;
  isRpaOpen: boolean;
  isPiaOpen: boolean;
  isTiaOpen: boolean;
  setIsRpaOpen: Dispatch<SetStateAction<boolean>>;
  setIsPiaOpen: Dispatch<SetStateAction<boolean>>;
  setIsTiaOpen: Dispatch<SetStateAction<boolean>>;
  onRpaCompletedCallback: (
    procedureQueue: ProcedureQueueItem[],
    selectedTask: Task
  ) => void;
  onProcedureCompletedCallback: (procedure: ProcedureQueueItem) => void;
}
