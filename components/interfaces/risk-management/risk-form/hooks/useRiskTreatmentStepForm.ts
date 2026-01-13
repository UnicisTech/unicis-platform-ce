import { useForm } from 'react-hook-form';
import type { RiskTreatmentStepValues } from '../types';
import type { RMProcedureInterface } from 'types';

export default function useRiskTreatmentStepForm(
  procedure: RMProcedureInterface
) {
  const initial = procedure[1] || ({} as RiskTreatmentStepValues);
  return useForm<RiskTreatmentStepValues>({
    defaultValues: {
      RiskTreatment: initial.RiskTreatment ?? '',
      TreatmentCost: initial.TreatmentCost ?? '',
      TreatmentStatus: initial.TreatmentStatus ?? 50,
      TreatedProbability: initial.TreatedProbability ?? 50,
      TreatedImpact: initial.TreatedImpact ?? 50,
    },
    mode: 'onChange',
  });
}
