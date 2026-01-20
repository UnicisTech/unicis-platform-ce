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
import { TransparencyStepValues } from '../types';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/pia';

const TransparencyStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[3];
  control: Control<TransparencyStepValues>;
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <p>{t('pia:descriptions.riskQuestion')}</p>
      <p>{t('pia:descriptions.transparencyStep')}</p>

      {/* Probability */}
      <FormField
        control={control}
        name="transparencyRiskProbability"
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.transparencyRiskProbability ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`pia:fields.isDataProcessingNecessary`)}
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.transparencyRiskProbability.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(`pia:risk-probability.${item}`)}</label>
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
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.transparencyRiskSecurity ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.transparencyRiskSecurity`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.transparencyRiskSecurity.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(`pia:transparencyRiskSecurity.${item}`)}</label>
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
            <FormLabel>{t(`pia:fields.transparencyAssessment`)}</FormLabel>
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

export default TransparencyStep;
