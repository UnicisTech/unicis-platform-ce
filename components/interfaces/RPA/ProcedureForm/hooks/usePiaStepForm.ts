import { useForm } from 'react-hook-form';
import type { RpaProcedureInterface } from 'types';
import type { PiaStepValues } from '../types';

export function usePiaStepForm(procedure: RpaProcedureInterface) {
  const initial = procedure[5] || ({} as PiaStepValues);
  return useForm<PiaStepValues>({
    defaultValues: {
      involveProfiling: initial.involveProfiling ?? 'no',
      useAutomated: initial.useAutomated ?? 'no',
      involveSurveillance: initial.involveSurveillance ?? 'no',
      processedSpecialCategories: initial.processedSpecialCategories ?? 'no',
      isBigData: initial.isBigData ?? 'no',
      dataSetsCombined: initial.dataSetsCombined ?? 'no',
      multipleControllers: initial.multipleControllers ?? 'no',
      imbalanceInRelationship: initial.imbalanceInRelationship ?? 'no',
      innovativeTechnologyUsed: initial.innovativeTechnologyUsed ?? 'no',
      transferredOutside: initial.transferredOutside ?? 'no',
      rightsRestricted: initial.rightsRestricted ?? 'no',
      piaNeeded: initial.piaNeeded ?? 'no',
    },
    mode: 'onChange',
  });
}
