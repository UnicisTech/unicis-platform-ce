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
import { AvailabilityStepValues } from '../types';

const AvailabilityStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[2];
  control: Control<AvailabilityStepValues>;
}) => (
  <>
    <p>
      What are the risks to the privacy and rights of the people whose data is
      being processed?
    </p>
    <p>2. Availability</p>

    {/* Probability of availability risk */}
    <FormField
      control={control}
      name="availabilityRiskProbability"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.availabilityRiskProbability ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.availabilityRiskProbability}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.availabilityRiskProbability.map((opt) => (
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

    {/* Security of availability risk */}
    <FormField
      control={control}
      name="availabilityRiskSecurity"
      rules={{ required: 'Please select an option.' }}
      defaultValue={initial?.availabilityRiskSecurity ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.availabilityRiskSecurity}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {config.availabilityRiskSecurity.map((opt) => (
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
      name="availabilityAssessment"
      defaultValue={initial?.availabilityAssessment ?? ''}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldPropsMapping.availabilityAssessment}</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default AvailabilityStep;
