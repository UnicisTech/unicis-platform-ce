import { useForm } from 'react-hook-form';
import type { RpaProcedureInterface } from 'types';
import type { SecurityMeasuresStepValues } from '../types';

export default function useSecurityMeasuresStepForm(
  procedure: RpaProcedureInterface
) {
  const initial = procedure[4] || ({} as SecurityMeasuresStepValues);
  return useForm<SecurityMeasuresStepValues>({
    defaultValues: {
      toms: initial.toms ?? [],
    },
    mode: 'onChange',
  });
}
