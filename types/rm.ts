import { Task } from "@prisma/client";
import type { AuditLog } from "./base";

export type RmOption = {
    label: string;
    value: string;
};

export type RMProcedureInterface = [
    {
        Risk: string;
        AssetOwner: RmOption; //Or a number - the id of the user
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
