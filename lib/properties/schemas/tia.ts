import { z, type ZodType } from 'zod';
import type {
  StoredTiaProcedureInterface,
  TiaProcedureInterface,
  TiaShortProcedureInterface,
} from 'types/tia';

const yesNoSchema = z.enum(['yes', 'no']);
const yesNoNaSchema = z.enum(['yes', 'no', 'na']);

const tiaFullProcedureTupleSchema = z.tuple([
  z
    .object({
      DataExporter: z.string(),
      CountryDataExporter: z.string(),
      DataImporter: z.string(),
      CountryDataImporter: z.string(),
      TransferScenario: z.string(),
      DataAtIssue: z.string(),
      HowDataTransfer: z.string(),
      StartDateAssessment: z.string(),
      AssessmentYears: z.number(),
      LawImporterCountry: z.string(),
    })
    .passthrough(),
  z
    .object({
      EncryptionInTransit: yesNoNaSchema,
      ReasonEncryptionInTransit: z.string(),
      TransferMechanism: yesNoNaSchema,
      ReasonTransferMechanism: z.string(),
      LawfulAccess: yesNoNaSchema,
      ReasonLawfulAccess: z.string(),
      MassSurveillanceTelecommunications: yesNoNaSchema,
      ReasonMassSurveillanceTelecommunications: z.string(),
      SelfReportingObligations: yesNoNaSchema,
      ReasonSelfReportingObligations: z.string(),
    })
    .passthrough(),
  z
    .object({
      WarrantsSubpoenas: z.enum(['1', '0']),
      ReasonWarrantsSubpoenas: z.string(),
      ViolationLocalLaw: z.enum(['1', '0']),
      ReasonViolationLocalLaw: z.string(),
      HighViolationLocalLaw: z.enum(['2', '0']),
      ReasonHighViolationLocalLaw: z.string(),
      HighViolationDataIssue: z.enum(['2', '0']),
      ReasonHighViolationDataIssue: z.string(),
      InvestigatingImporter: z.enum(['2', '0']),
      ReasonInvestigatingImporter: z.string(),
      PastWarrantSubpoena: z.enum(['3', '0']),
      ReasonPastWarrantSubpoena: z.string(),
      DataIssueInvestigation: z.enum(['2', '0']),
      ReasonDataIssueInvestigation: z.string(),
      LocalIssueWarrants: z.enum(['2', '0']),
      ReasonLocalIssueWarrants: z.string(),
      LocalMassSurveillance: z.enum(['3', '0']),
      ReasonLocalMassSurveillance: z.string(),
      LocalAccessMassSurveillance: z.enum(['1', '0']),
      ReasonLocalAccessMassSurveillance: z.string(),
      LocalRoutinelyMonitor: z.enum(['2', '0']),
      ReasonLocalRoutinelyMonitor: z.string(),
      PassMassSurveillance: z.enum(['4', '0']),
      ReasonPassMassSurveillance: z.string(),
      PassMassSurveillanceConnection: z.enum(['4', '0']),
      ReasonPassMassSurveillanceConnection: z.string(),
      ImporterObligation: z.enum(['2', '0']),
      ReasonImporterObligation: z.string(),
      LocalSelfReporting: z.enum(['2', '0']),
      ReasonLocalSelfReporting: z.string(),
      PastSelfReporting: z.enum(['4', '0']),
      ReasonPastSelfReporting: z.string(),
      AssessmentProduceReport: z.enum(['4', '0']),
      ReasonAssessmentProduceReport: z.string(),
    })
    .passthrough(),
  z
    .object({
      RelevantDataTransferImporter: z.string(),
      ProbabilityDataTransferImporter: z.string(),
      ReasonDataTransferImporter: z.string(),
      RelevantTransferToImporter: z.string(),
      ProbabilityTransferToImporter: z.string(),
      ReasonTransferToImporter: z.string(),
      RelevantTransferToImporterForPerformance: z.string(),
      ProbabilityTransferToImporterPerformance: z.string(),
      ReasonTransferToImporterPerformance: z.string(),
      RelevantLegalGround: z.string(),
      ProbabilityLegalGround: z.string(),
      ReasonLegalGround: z.string(),
      ConnectionTargetedAccess: yesNoSchema,
      ReasonConnectionTargetedAccess: z.string(),
      ConnectionSurveillanceTele: yesNoSchema,
      ReasonConnectionSurveillanceTele: z.string(),
      ConnectionSelfreportingObligations: yesNoSchema,
      ReasonConnectionSelfreportingObligations: z.string(),
    })
    .passthrough(),
]);

export const tiaFullProcedureSchema: ZodType<TiaProcedureInterface> =
  tiaFullProcedureTupleSchema;

export const tiaShortProcedureSchema: ZodType<TiaShortProcedureInterface> =
  z.tuple([
    tiaFullProcedureTupleSchema.items[0],
    tiaFullProcedureTupleSchema.items[1],
  ]);

export const tiaProcedureSchema: ZodType<StoredTiaProcedureInterface> = z.union(
  [tiaShortProcedureSchema, tiaFullProcedureSchema]
);
