'use client';

import * as React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  fieldPropsMapping,
  config,
} from '@/components/defaultLanding/data/configs/pia';
import type { PiaRisk } from 'types';
import { DataProcessingStepValues } from '../types';

const DataProcessingStep = ({
  initial,
  control,
}: {
  initial: PiaRisk[0] | null | undefined;
  control: Control<DataProcessingStepValues>;
}) => (
  <>
    <p>
      Is the data processing necessary, and is it proportional to the purpose?
    </p>

    <FormField
      control={control}
      name="isDataProcessingNecessary"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.isDataProcessingNecessary ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.isDataProcessingNecessary}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.isDataProcessingNecessary.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <label htmlFor={opt.value}>{opt.label}</label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="isDataProcessingNecessaryAssessment"
      defaultValue={initial?.isDataProcessingNecessaryAssessment ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {fieldPropsMapping.isDataProcessingNecessaryAssessment}
          </FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="isProportionalToPurpose"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.isProportionalToPurpose ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.isProportionalToPurpose}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.isProportionalToPurpose.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <label htmlFor={opt.value}>{opt.label}</label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="isProportionalToPurposeAssessment"
      defaultValue={initial?.isProportionalToPurposeAssessment ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {fieldPropsMapping.isProportionalToPurposeAssessment}
          </FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default DataProcessingStep;
