import { useForm } from 'react-hook-form';
import type { RpaProcedureInterface } from 'types';
import type { PurposeAndCategoriesStepValues } from '../types';

export default function usePurposeAndCategoriesStepForm(
  procedure: RpaProcedureInterface
) {
  const initial = procedure[1] || ({} as PurposeAndCategoriesStepValues);
  return useForm<PurposeAndCategoriesStepValues>({
    defaultValues: {
      purpose: initial.purpose ?? '',
      category: initial.category ?? [],
      specialcategory: initial.specialcategory ?? [],
      datasubject: initial.datasubject ?? [],
      retentionperiod: initial.retentionperiod,
      commentsretention: initial.commentsretention ?? '',
    },
    mode: 'onChange',
  });
}
