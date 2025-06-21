'use client';

import * as React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import type { Control } from 'react-hook-form';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
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
  return (
    <>
      {fieldOrder.map((fieldName) => (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fieldPropsMapping[fieldName]}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  {config[fieldName].map((opt: any) => (
                    <div
                      key={opt.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`${fieldName}-${opt.value}`}
                      />
                      <label htmlFor={`${fieldName}-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
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
