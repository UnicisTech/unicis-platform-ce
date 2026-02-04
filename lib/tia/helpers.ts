export function getTranslationKey(
  value: string | number | null | undefined
): string | number | null | undefined {
  if (value === null || value === undefined) return value;

  const v = String(value).toLowerCase();

  if (v === 'yes' || v === 'no' || v === 'na') return v;
  if (v === '0') return 'no';
  if (v === '1' || v === '2' || v === '3' || v === '4') return 'yes';

  return null;
}

export const shouldSkipTwoSteps = (formData: any) =>
  [
    'LawfulAccess',
    'MassSurveillanceTelecommunications',
    'SelfReportingObligations',
  ]
    .map((prop) => ['yes', 'na'].includes(formData[prop]))
    .every((result) => result === true);

export const isTranferPermitted = (procedure: any): boolean => {
  if (!procedure[1]) return false;

  const {
    EncryptionInTransit,
    TransferMechanism,
    LawfulAccess,
    MassSurveillanceTelecommunications,
    SelfReportingObligations,
  } = procedure[1];

  // procedure[3] || [] - procedure[3] may not exist if the procedure is permitted on second step
  const {
    ConnectionTargetedAccess,
    ConnectionSurveillanceTele,
    ConnectionSelfreportingObligations,
  } = procedure[3] || [];

  if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
    return false;
  }

  if (LawfulAccess === 'no' && ConnectionTargetedAccess === 'yes') {
    return false;
  }

  if (
    MassSurveillanceTelecommunications === 'no' &&
    ConnectionSurveillanceTele === 'yes'
  ) {
    return false;
  }

  if (
    SelfReportingObligations === 'no' &&
    ConnectionSelfreportingObligations === 'yes'
  ) {
    return false;
  }

  return true;
};

export type TransferIsStatus =
  | 'not-permitted'
  | 'permitted-step-4'
  | 'permitted';

export const getTransferIsValue = (formData: any): TransferIsStatus => {
  //TODO: remove legacy verison
  if (!formData) return 'not-permitted';

  //legacy version is formData.values
  const {
    EncryptionInTransit,
    TransferMechanism,
    LawfulAccess,
    MassSurveillanceTelecommunications,
    SelfReportingObligations,
  } = formData.values || formData;

  if (EncryptionInTransit === 'no' || TransferMechanism === 'no') {
    return 'not-permitted';
  }

  if (
    LawfulAccess === 'no' ||
    MassSurveillanceTelecommunications === 'no' ||
    SelfReportingObligations === 'no'
  ) {
    return 'permitted-step-4';
  }

  return 'permitted';
};

export const getTiaRisks = (state) => {
  //TODO: remove legacy version
  if (!state) {
    return {
      targetedRisk: 0,
      nonTargetedRisk: 0,
      selfReportingRisk: 0,
    };
  }

  const {
    WarrantsSubpoenas,
    ViolationLocalLaw,
    HighViolationLocalLaw,
    HighViolationDataIssue,
    InvestigatingImporter,
    PastWarrantSubpoena,
    LocalIssueWarrants,
    LocalMassSurveillance,
    LocalAccessMassSurveillance,
    LocalRoutinelyMonitor,
    PassMassSurveillance,
    ImporterObligation,
    LocalSelfReporting,
    PastSelfReporting,
  } = state || state.values;

  const targetedRisk =
    Number(WarrantsSubpoenas) +
    Number(ViolationLocalLaw) +
    Number(HighViolationLocalLaw) +
    Number(HighViolationDataIssue) +
    Number(InvestigatingImporter) +
    Number(PastWarrantSubpoena);

  const nonTargetedRisk =
    Number(LocalIssueWarrants) +
    Number(LocalMassSurveillance) +
    Number(LocalAccessMassSurveillance) +
    Number(LocalRoutinelyMonitor) +
    Number(PassMassSurveillance);

  const selfReportingRisk =
    Number(ImporterObligation) +
    Number(LocalSelfReporting) +
    Number(PastSelfReporting);

  return { targetedRisk, nonTargetedRisk, selfReportingRisk };
};

export const getProblematicLawfulAccesses = (formState: any) => {
  //TODO: remove legacy version
  // const formData = formState?.values;
  const formData = formState;

  if (!formData) {
    return {
      isDataIssueInvestigationEqualToTwo: false,
      isPassMassSurveillanceConnectionEqualToFour: false,
      isAssessmentProduceReportEqualToFour: false,
    };
  }

  const isDataIssueInvestigationProblematic =
    formData.DataIssueInvestigation === '2';
  const isPassMassSurveillanceConnectionProblematic =
    formData.PassMassSurveillanceConnection === '4';
  const isAssessmentProduceReportProblematic =
    formData.AssessmentProduceReport === '4';

  return {
    isDataIssueInvestigationProblematic,
    isPassMassSurveillanceConnectionProblematic,
    isAssessmentProduceReportProblematic,
  };
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
