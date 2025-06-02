import type { Dispatch, SetStateAction } from 'react';
import type { Task } from '@prisma/client';
import type { Session } from 'next-auth';
import type { Diff, Option } from './base';

export type RpaProcedureInterface = [
  {
    reviewDate: string;
    controller: string;
    dpo: Option;
  },
  {
    purpose?: string;
    category: Option[];
    datasubject: Option[];
    retentionperiod: Option;
    specialcategory: Option[];
    commentsretention?: string;
  },
  {
    recipientType: Option;
    recipientdetails?: string;
  },
  {
    datatransfer: boolean;
    recipient: string;
    country: Option;
    guarantee: Option[];
  },
  {
    toms: Option[];
  },
  {
    involveProfiling: string;
    useAutomated: string;
    involveSurveillance: string;
    processedSpecialCategories: string;
    isBigData: string;
    dataSetsCombined: string;
    multipleControllers: string;
    imbalanceInRelationship: string;
    innovativeTechnologyUsed: string;
    transferredOutside: string;
    rightsRestricted: string;
    piaNeeded: string;
  }
];

export interface RpaConfig {
  category: Option[];
  specialcategory: Option[];
  datasubject: Option[];
  retentionperiod: Option[];
  recipientType: Option[];
  guarantee: Option[];
  toms: Option[];
  country: Option[];
  involveProfiling: Option[];
  useAutomated: Option[];
  involveSurveillance: Option[];
  processedSpecialCategories: Option[];
  isBigData: Option[];
  dataSetsCombined: Option[];
  multipleControllers: Option[];
  imbalanceInRelationship: Option[];
  innovativeTechnologyUsed: Option[];
  transferredOutside: Option[];
  rightsRestricted: Option[];
  piaNeeded: Option[];
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
