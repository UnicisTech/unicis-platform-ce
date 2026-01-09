import React from 'react';
import { TFunction } from 'next-i18next';
import { getTranslationKey } from '@/lib/tia/helpers';

type AuditValue = string | string[] | null | undefined;


export const auditLogHelper = (
  field: string | undefined,
  value: AuditValue,
  t: TFunction,
) => {
  if (value == null) return <span>—</span>;

  switch (field) {
    case 'DataExporter':
    case 'DataImporter':
    case 'TransferScenario':
    case 'DataAtIssue':
    case 'HowDataTransfer':
    case 'StartDateAssessment':
    case 'AssessmentYears':
    case 'EndDateAssessment':
    case 'ReasonEncryptionInTransit':
    case 'ReasonTransferMechanism':
    case 'ReasonLawfulAccess':
    case 'ReasonMassSurveillanceTelecommunications':
    case 'ReasonSelfReportingObligations':
    case 'ReasonWarrantsSubpoenas':
    case 'ReasonViolationLocalLaw':
    case 'ReasonHighViolationLocalLaw':
    case 'ReasonHighViolationDataIssue':
    case 'ReasonInvestigatingImporter':
    case 'ReasonPastWarrantSubpoena':
    case 'ReasonDataIssueInvestigation':
    case 'ReasonLocalIssueWarrants':
    case 'ReasonLocalMassSurveillance':
    case 'ReasonLocalAccessMassSurveillance':
    case 'ReasonLocalRoutinelyMonitor':
    case 'ReasonPassMassSurveillance':
    case 'ReasonPassMassSurveillanceConnection':
    case 'ReasonImporterObligation':
    case 'ReasonLocalSelfReporting':
    case 'ReasonPastSelfReporting':
    case 'ReasonAssessmentProduceReport':
    case 'RelevantDataTransferImporter':
    case 'ProbabilityDataTransferImporter':
    case 'ReasonDataTransferImporter':
    case 'RelevantTransferToImporter':
    case 'ProbabilityTransferToImporter':
    case 'ReasonTransferToImporter':
    case 'RelevantTransferToImporterForPerformance':
    case 'ProbabilityTransferToImporterPerformance':
    case 'ReasonTransferToImporterPerformance':
    case 'RelevantLegalGround':
    case 'ProbabilityLegalGround':
    case 'ReasonLegalGround':
    case 'ReasonConnectionTargetedAccess':
    case 'ReasonConnectionSurveillanceTele':
    case 'ReasonConnectionSelfreportingObligations':
        return <span>{value}</span>
    case 'CountryDataExporter':
    case 'CountryDataImporter':
    case 'LawImporterCountry':
        return <span>{t(`country.${value}`)}</span>
    case 'EncryptionInTransit':
    case 'TransferMechanism':
    case 'LawfulAccess':
    case 'MassSurveillanceTelecommunications':
    case 'SelfReportingObligations':
    case 'ConnectionTargetedAccess':
    case 'ConnectionSurveillanceTele':
    case 'ConnectionSelfreportingObligations':
        return <span>{t(value)}</span>
    case 'WarrantsSubpoenas':
    case 'ViolationLocalLaw':
    case 'HighViolationLocalLaw':
    case 'HighViolationDataIssue':
    case 'InvestigatingImporter':
    case 'PastWarrantSubpoena':
    case 'DataIssueInvestigation':
    case 'LocalIssueWarrants':
    case 'LocalMassSurveillance':
    case 'LocalAccessMassSurveillance':
    case 'LocalRoutinelyMonitor':
    case 'PassMassSurveillance':
    case 'PassMassSurveillanceConnection':
    case 'ImporterObligation':
    case 'LocalSelfReporting':
    case 'PastSelfReporting':
    case 'AssessmentProduceReport':
        return <span>{t(getTranslationKey(String(value)))}</span>
    default:
      return <span>{value ?? '—'}</span>;
  }
};