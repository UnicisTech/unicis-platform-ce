import * as React from 'react';
import { useTranslation } from 'next-i18next';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { Label } from '@/components/shadcn/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import type { Control } from 'react-hook-form';
import type { PiaStepValues } from '../types';

export interface PiaStepProps {
  control: Control<PiaStepValues>;
}

const fieldOrder: (keyof PiaStepValues)[] = [
  'involveProfiling',
  'useAutomated',
  'involveSurveillance',
  'processedSpecialCategories',
  'isBigData',
  'dataSetsCombined',
  'multipleControllers',
  'imbalanceInRelationship',
  'innovativeTechnologyUsed',
  'transferredOutside',
  'rightsRestricted',
  'piaNeeded',
];

export function PiaStep({ control }: PiaStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      {fieldOrder.map((fieldName) => (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(`rpa:fields.${fieldName}`)}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${fieldName}-yes`} />
                    <Label htmlFor={`${fieldName}-yes`}>{t('yes')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${fieldName}-no`} />
                    <Label htmlFor={`${fieldName}-no`}>{t('no')}</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
