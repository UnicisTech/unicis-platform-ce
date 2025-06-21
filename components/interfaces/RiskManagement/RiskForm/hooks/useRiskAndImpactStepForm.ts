import { useForm } from 'react-hook-form';
import type { RiskAndImpactStepValues } from '../types';
import type { RMProcedureInterface } from 'types';

export default function useRiskAndImpactStepForm(
  procedure: RMProcedureInterface
) {
  const initial = procedure[0] || ({} as RiskAndImpactStepValues);
  return useForm<RiskAndImpactStepValues>({
    defaultValues: {
      Risk: initial.Risk ?? '',
      AssetOwner: initial.AssetOwner ?? { value: '', label: '' },
      Impact: initial.Impact ?? '',
      RawProbability: initial.RawProbability ?? 50,
      RawImpact: initial.RawImpact ?? 50,
    },
    mode: 'onChange',
  });
}
