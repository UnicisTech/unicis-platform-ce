import type { Task } from '@prisma/client';

type R_Yes_No = 'yes' | 'no';

type R_Yes_No_Na = 'yes' | 'no' | 'na';

type R_1_0 = '1' | '0';

type R_2_0 = '2' | '0';

type R_3_0 = '3' | '0';

type R_4_0 = '4' | '0';

type Country = {
  label: string;
  value: string;
};

export type TiaTranferData = {
  EncryptionInTransit: R_Yes_No_Na;
  TransferMechanism: R_Yes_No_Na;
  LawfulAccess: R_Yes_No_Na;
  MassSurveillanceTelecommunications: R_Yes_No_Na;
  SelfReportingObligations: R_Yes_No_Na;
};

export type TiaOption = {
  label: string;
  value: string;
};

export const defaultProcedure = [
  {
    DataExporter: '',
    CountryDataExporter: null,
    DataImporter: '',
    CountryDataImporter: null,
    TransferScenario: '',
    DataAtIssue: '',
    HowDataTransfer: '',
    StartDateAssessment: '',
    AssessmentYears: 1,
    LawImporterCountry: null,
  },
  {
    EncryptionInTransit: 'yes',
    ReasonEncryptionInTransit: '',
    TransferMechanism: 'yes',
    ReasonTransferMechanism: '',
    LawfulAccess: 'yes',
    ReasonLawfulAccess: '',
    MassSurveillanceTelecommunications: 'yes',
    ReasonMassSurveillanceTelecommunications: '',
    SelfReportingObligations: 'yes',
    ReasonSelfReportingObligations: '',
  },
  {
    WarrantsSubpoenas: '1',
    ReasonWarrantsSubpoenas: '',
    ViolationLocalLaw: '1',
    ReasonViolationLocalLaw: '',
    HighViolationLocalLaw: '2',
    ReasonHighViolationLocalLaw: '',
    HighViolationDataIssue: '2',
    ReasonHighViolationDataIssue: '',
    InvestigatingImporter: '2',
    ReasonInvestigatingImporter: '',
    PastWarrantSubpoena: '3',
    ReasonPastWarrantSubpoena: '',
    DataIssueInvestigation: '0',
    ReasonDataIssueInvestigation: '',

    LocalIssueWarrants: '2',
    ReasonLocalIssueWarrants: '',
    LocalMassSurveillance: '3',
    ReasonLocalMassSurveillance: '',
    LocalAccessMassSurveillance: '1',
    ReasonLocalAccessMassSurveillance: '',
    LocalRoutinelyMonitor: '2',
    ReasonLocalRoutinelyMonitor: '',
    PassMassSurveillance: '4',
    ReasonPassMassSurveillance: '',
    PassMassSurveillanceConnection: '0',
    ReasonPassMassSurveillanceConnection: '',
    ImporterObligation: '2',
    ReasonImporterObligation: '',
    LocalSelfReporting: '2',
    ReasonLocalSelfReporting: '',
    PastSelfReporting: '4',
    ReasonPastSelfReporting: '',
    AssessmentProduceReport: '0',
    ReasonAssessmentProduceReport: '',
  },
  {
    RelevantDataTransferImporter: '',
    ProbabilityDataTransferImporter: '',
    ReasonDataTransferImporter: '',
    RelevantTransferToImporter: '',
    ProbabilityTransferToImporter: '',
    ReasonTransferToImporter: '',
    RelevantTransferToImporterForPerformance: '',
    ProbabilityTransferToImporterPerformance: '',
    ReasonTransferToImporterPerformance: '',
    RelevantLegalGround: '',
    ProbabilityLegalGround: '',
    ReasonLegalGround: '',

    ConnectionTargetedAccess: 'yes',
    ReasonConnectionTargetedAccess: '',
    ConnectionSurveillanceTele: 'yes',
    ReasonConnectionSurveillanceTele: '',
    ConnectionSelfreportingObligations: 'yes',
    ReasonConnectionSelfreportingObligations: '',
  },
];

export type TiaProcedureInterface = [
  {
    DataExporter: string;
    CountryDataExporter: Country;
    DataImporter: string;
    CountryDataImporter: Country;
    TransferScenario: string;
    DataAtIssue: string;
    HowDataTransfer: string;
    StartDateAssessment: string;
    AssessmentYears: number;
    LawImporterCountry: Country;
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
  }
];

export type TaskWithTiaProcedure = Task & {
  properties: {
    tia_procedure: TiaProcedureInterface;
  };
};
