import { useForm } from 'react-hook-form';
import type { PiaRisk } from 'types';
import type { DataProcessingStepValues } from '../types';

export default function useDataProcessingStepForm(risk: PiaRisk) {
  return useForm<DataProcessingStepValues>({
    defaultValues: {
      isDataProcessingNecessary: risk[0]?.isDataProcessingNecessary ?? '',
      isDataProcessingNecessaryAssessment:
        risk[0]?.isDataProcessingNecessaryAssessment ?? '',
      isProportionalToPurpose: risk[0]?.isProportionalToPurpose ?? '',
      isProportionalToPurposeAssessment:
        risk[0]?.isProportionalToPurposeAssessment ?? '',
    },
    mode: 'onChange',
  });
}
