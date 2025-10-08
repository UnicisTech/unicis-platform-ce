import { Task } from '@prisma/client';
import type { AuditLog, Option } from './base';

export type RMProcedureInterface = [
  {
    Risk: string;
    AssetOwner: Option;
    Impact: string;
    RawProbability: number;
    RawImpact: number;
  },
  {
    RiskTreatment: string;
    TreatmentCost: string;
    TreatmentStatus: number;
    TreatedProbability: number;
    TreatedImpact: number;
  },
];

export type TaskRmProperties = {
  rm_risk?: RMProcedureInterface | [];
  rm_audit_logs: AuditLog[] | [];
};

export type TaskWithRmRisk = Task & {
  properties: {
    rm_risk: RMProcedureInterface;
  };
};
