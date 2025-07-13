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
import { ConfidentialityStepValues } from '../types';

const ConfidentialityStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[1];
  control: Control<ConfidentialityStepValues>;
}) => {
  return (
    <>
      <p>
        What are the risks to the privacy and rights of the people whose data is
        being processed?
      </p>
      <p>1. Confidentiality and Integrity</p>

      <FormField
        control={control}
        name="confidentialityRiskProbability"
        rules={{ required: 'Please select an option.' }}
        defaultValue={initial?.confidentialityRiskProbability ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldPropsMapping.confidentialityRiskProbability}
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.confidentialityRiskProbability.map((opt) => (
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
        name="confidentialityRiskSecurity"
        rules={{ required: 'Please select an option.' }}
        defaultValue={initial?.confidentialityRiskSecurity ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldPropsMapping.confidentialityRiskSecurity}
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.confidentialityRiskSecurity.map((opt) => (
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
        name="confidentialityAssessment"
        defaultValue={initial?.confidentialityAssessment ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.confidentialityAssessment}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ConfidentialityStep;
