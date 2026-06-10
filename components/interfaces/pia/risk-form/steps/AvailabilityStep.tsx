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
import type { PiaRisk } from 'types';
import { AvailabilityStepValues } from '../types';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/pia';

const AvailabilityStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[2];
  control: Control<AvailabilityStepValues>;
}) => {
  const { t } = useTranslation(['common', 'pia']);

  return (
    <>
      <p>{t('pia:descriptions.riskQuestion')}</p>
      <p>{t('pia:descriptions.availabilityStep')}</p>

      {/* Probability of availability risk */}
      <FormField
        control={control}
        name="availabilityRiskProbability"
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.availabilityRiskProbability ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.availabilityRiskProbability`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.availabilityRiskProbability.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>
                      {t(`pia:risk-probability.${item}`)}
                    </label>
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
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.availabilityRiskSecurity ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.availabilityRiskSecurity`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.availabilityRiskSecurity.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>
                      {t(`pia:availabilityRiskSecurity.${item}`)}
                    </label>
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
            <FormLabel>{t(`pia:fields.availabilityAssessment`)}</FormLabel>
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

export default AvailabilityStep;
