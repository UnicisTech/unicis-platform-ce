import { useForm } from 'react-hook-form';
import type { PiaRisk } from 'types';
import type { TransparencyStepValues } from '../types';

export default function useTransparencyStepForm(risk: PiaRisk) {
  return useForm<TransparencyStepValues>({
    defaultValues: {
      transparencyRiskProbability: risk[3]?.transparencyRiskProbability ?? '',
      transparencyRiskSecurity: risk[3]?.transparencyRiskSecurity ?? '',
      transparencyAssessment: risk[3]?.transparencyAssessment ?? '',
    },
    mode: 'onChange',
  });
}
