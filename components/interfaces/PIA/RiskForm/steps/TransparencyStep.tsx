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
import { TransparencyStepValues } from '../types';

const TransparencyStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[3];
  control: Control<TransparencyStepValues>;
}) => (
  <>
    <p>
      What are the risks to the privacy and rights of the people whose data is
      being processed?
    </p>
    <p>3. Transparency, anonymization and data minimization</p>

    {/* Probability */}
    <FormField
      control={control}
      name="transparencyRiskProbability"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.transparencyRiskProbability ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.transparencyRiskProbability}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.transparencyRiskProbability.map((opt) => (
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

    {/* Security */}
    <FormField
      control={control}
      name="transparencyRiskSecurity"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.transparencyRiskSecurity ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.transparencyRiskSecurity}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.transparencyRiskSecurity.map((opt) => (
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

    {/* Assessment textarea */}
    <FormField
      control={control}
      name="transparencyAssessment"
      defaultValue={initial?.transparencyAssessment ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.transparencyAssessment}</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default TransparencyStep;
