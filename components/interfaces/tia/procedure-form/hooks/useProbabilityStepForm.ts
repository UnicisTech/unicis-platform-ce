import { useForm } from 'react-hook-form';
import type { TiaProcedureInterface } from 'types';
import type { ProbabilityStepValues } from '../types';

//TODO: instead of ?? "" we can use defaultProcudure from types/tia.ts in all hooks
export default function useProbabilityStepForm(
  procedure: TiaProcedureInterface
) {
  const initial = procedure[3] || {};
  return useForm<ProbabilityStepValues>({
    defaultValues: {
      RelevantDataTransferImporter: initial.RelevantDataTransferImporter ?? '',
      ProbabilityDataTransferImporter:
        initial.ProbabilityDataTransferImporter ?? '',
      ReasonDataTransferImporter: initial.ReasonDataTransferImporter ?? '',
      RelevantTransferToImporter: initial.RelevantTransferToImporter ?? '',
      ProbabilityTransferToImporter:
        initial.ProbabilityTransferToImporter ?? '',
      ReasonTransferToImporter: initial.ReasonTransferToImporter ?? '',
      RelevantTransferToImporterForPerformance:
        initial.RelevantTransferToImporterForPerformance ?? '',
      ProbabilityTransferToImporterPerformance:
        initial.ProbabilityTransferToImporterPerformance ?? '',
      ReasonTransferToImporterPerformance:
        initial.ReasonTransferToImporterPerformance ?? '',
      RelevantLegalGround: initial.RelevantLegalGround ?? '',
      ProbabilityLegalGround: initial.ProbabilityLegalGround ?? '',
      ReasonLegalGround: initial.ReasonLegalGround ?? '',
      ConnectionTargetedAccess: initial.ConnectionTargetedAccess ?? 'yes',
      ReasonConnectionTargetedAccess:
        initial.ReasonConnectionTargetedAccess ?? '',
      ConnectionSurveillanceTele: initial.ConnectionSurveillanceTele ?? 'yes',
      ReasonConnectionSurveillanceTele:
        initial.ReasonConnectionSurveillanceTele ?? '',
      ConnectionSelfreportingObligations:
        initial.ConnectionSelfreportingObligations ?? 'yes',
      ReasonConnectionSelfreportingObligations:
        initial.ReasonConnectionSelfreportingObligations ?? '',
    },
    mode: 'onChange',
  });
}
