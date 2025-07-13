import { useForm } from 'react-hook-form';
import type { TiaProcedureInterface } from 'types';
import type { RiskStepValues } from '../types';

export default function useRiskStepForm(procedure: TiaProcedureInterface) {
  const initial = procedure[2] || {};
  return useForm<RiskStepValues>({
    defaultValues: {
      WarrantsSubpoenas: initial.WarrantsSubpoenas ?? '1',
      ReasonWarrantsSubpoenas: initial.ReasonWarrantsSubpoenas ?? '',
      ViolationLocalLaw: initial.ViolationLocalLaw ?? '1',
      ReasonViolationLocalLaw: initial.ReasonViolationLocalLaw ?? '',
      HighViolationLocalLaw: initial.HighViolationLocalLaw ?? '2',
      ReasonHighViolationLocalLaw: initial.ReasonHighViolationLocalLaw ?? '',
      HighViolationDataIssue: initial.HighViolationDataIssue ?? '2',
      ReasonHighViolationDataIssue: initial.ReasonHighViolationDataIssue ?? '',
      InvestigatingImporter: initial.InvestigatingImporter ?? '2',
      ReasonInvestigatingImporter: initial.ReasonInvestigatingImporter ?? '',
      PastWarrantSubpoena: initial.PastWarrantSubpoena ?? '3',
      ReasonPastWarrantSubpoena: initial.ReasonPastWarrantSubpoena ?? '',
      DataIssueInvestigation: initial.DataIssueInvestigation ?? '2',
      ReasonDataIssueInvestigation: initial.ReasonDataIssueInvestigation ?? '',
      LocalIssueWarrants: initial.LocalIssueWarrants ?? '2',
      ReasonLocalIssueWarrants: initial.ReasonLocalIssueWarrants ?? '',
      LocalMassSurveillance: initial.LocalMassSurveillance ?? '3',
      ReasonLocalMassSurveillance: initial.ReasonLocalMassSurveillance ?? '',
      LocalAccessMassSurveillance: initial.LocalAccessMassSurveillance ?? '1',
      ReasonLocalAccessMassSurveillance:
        initial.ReasonLocalAccessMassSurveillance ?? '',
      LocalRoutinelyMonitor: initial.LocalRoutinelyMonitor ?? '2',
      ReasonLocalRoutinelyMonitor: initial.ReasonLocalRoutinelyMonitor ?? '',
      PassMassSurveillance: initial.PassMassSurveillance ?? '4',
      ReasonPassMassSurveillance: initial.ReasonPassMassSurveillance ?? '',
      PassMassSurveillanceConnection:
        initial.PassMassSurveillanceConnection ?? '4',
      ReasonPassMassSurveillanceConnection:
        initial.ReasonPassMassSurveillanceConnection ?? '',
      ImporterObligation: initial.ImporterObligation ?? '2',
      ReasonImporterObligation: initial.ReasonImporterObligation ?? '',
      LocalSelfReporting: initial.LocalSelfReporting ?? '2',
      ReasonLocalSelfReporting: initial.ReasonLocalSelfReporting ?? '',
      PastSelfReporting: initial.PastSelfReporting ?? '4',
      ReasonPastSelfReporting: initial.ReasonPastSelfReporting ?? '',
      AssessmentProduceReport: initial.AssessmentProduceReport ?? '4',
      ReasonAssessmentProduceReport:
        initial.ReasonAssessmentProduceReport ?? '',
    },
    mode: 'onChange',
  });
}
