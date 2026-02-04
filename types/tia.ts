import type { Task } from '@prisma/client';
import type { Session } from 'next-auth';
import type { Diff } from './base';

type R_Yes_No = 'yes' | 'no';

type R_Yes_No_Na = 'yes' | 'no' | 'na';

type R_1_0 = '1' | '0';

type R_2_0 = '2' | '0';

type R_3_0 = '3' | '0';

type R_4_0 = '4' | '0';

//TODO: get rid of this type
export type TiaOption = {
  label: string;
  value: string;
};

//TODO: RpaAuditLog and TiaAuditLog, use AuditLog from base.ts instead
export type TiaAuditLog = {
  actor: Session['user'];
  date: number;
  event: string;
  diff: Diff;
};

export type TiaProcedureInterface = [
  {
    DataExporter: string;
    CountryDataExporter: string;
    DataImporter: string;
    CountryDataImporter: string;
    TransferScenario: string;
    DataAtIssue: string;
    HowDataTransfer: string;
    StartDateAssessment: string;
    AssessmentYears: number;
    LawImporterCountry: string;
  },
  {
    EncryptionInTransit: R_Yes_No_Na;
    ReasonEncryptionInTransit: string;
    TransferMechanism: R_Yes_No_Na;
    ReasonTransferMechanism: string;
    LawfulAccess: R_Yes_No_Na;
    ReasonLawfulAccess: string;
    MassSurveillanceTelecommunications: R_Yes_No_Na;
    ReasonMassSurveillanceTelecommunications: string;
    SelfReportingObligations: R_Yes_No_Na;
    ReasonSelfReportingObligations: string;
  },
  {
    WarrantsSubpoenas: R_1_0;
    ReasonWarrantsSubpoenas: string;
    ViolationLocalLaw: R_1_0;
    ReasonViolationLocalLaw: string;
    HighViolationLocalLaw: R_2_0;
    ReasonHighViolationLocalLaw: string;
    HighViolationDataIssue: R_2_0;
    ReasonHighViolationDataIssue: string;
    InvestigatingImporter: R_2_0;
    ReasonInvestigatingImporter: string;
    PastWarrantSubpoena: R_3_0;
    ReasonPastWarrantSubpoena: string;
    DataIssueInvestigation: R_2_0;
    ReasonDataIssueInvestigation: string;
    LocalIssueWarrants: R_2_0;
    ReasonLocalIssueWarrants: string;
    LocalMassSurveillance: R_3_0;
    ReasonLocalMassSurveillance: string;
    LocalAccessMassSurveillance: R_1_0;
    ReasonLocalAccessMassSurveillance: string;
    LocalRoutinelyMonitor: R_2_0;
    ReasonLocalRoutinelyMonitor: string;
    PassMassSurveillance: R_4_0;
    ReasonPassMassSurveillance: string;
    PassMassSurveillanceConnection: R_4_0;
    ReasonPassMassSurveillanceConnection: string;
    ImporterObligation: R_2_0;
    ReasonImporterObligation: string;
    LocalSelfReporting: R_2_0;
    ReasonLocalSelfReporting: string;
    PastSelfReporting: R_4_0;
    ReasonPastSelfReporting: string;
    AssessmentProduceReport: R_4_0;
    ReasonAssessmentProduceReport: string;
  },
  {
    RelevantDataTransferImporter: string;
    ProbabilityDataTransferImporter: string;
    ReasonDataTransferImporter: string;
    RelevantTransferToImporter: string;
    ProbabilityTransferToImporter: string;
    ReasonTransferToImporter: string;
    RelevantTransferToImporterForPerformance: string;
    ProbabilityTransferToImporterPerformance: string;
    ReasonTransferToImporterPerformance: string;
    RelevantLegalGround: string;
    ProbabilityLegalGround: string;
    ReasonLegalGround: string;

    ConnectionTargetedAccess: R_Yes_No;
    ReasonConnectionTargetedAccess: string;
    ConnectionSurveillanceTele: R_Yes_No;
    ReasonConnectionSurveillanceTele: string;
    ConnectionSelfreportingObligations: R_Yes_No;
    ReasonConnectionSelfreportingObligations: string;
  },
];

export type TaskWithTiaProcedure = Task & {
  properties: {
    tia_procedure: TiaProcedureInterface;
  };
};

export type TaskTiaProperties = {
  tia_procedure?: TiaProcedureInterface | [];
  tia_audit_logs: TiaAuditLog[];
};
