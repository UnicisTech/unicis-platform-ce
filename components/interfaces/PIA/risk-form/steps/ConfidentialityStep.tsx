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
import { ConfidentialityStepValues } from '../types';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/pia';

const ConfidentialityStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[1];
  control: Control<ConfidentialityStepValues>;
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <p>{t('pia:descriptions.riskQuestion')}</p>
      <p>{t('pia:descriptions.confidentialityStep')}</p>

      <FormField
        control={control}
        name="confidentialityRiskProbability"
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.confidentialityRiskProbability ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`pia:fields.confidentialityRiskProbability`)}
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.confidentialityRiskProbability.map((item) => (
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

      <FormField
        control={control}
        name="confidentialityRiskSecurity"
        rules={{ required: t('errors.pleaseSelectAnOption') }}
        defaultValue={initial?.confidentialityRiskSecurity ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.confidentialityRiskSecurity`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.confidentialityRiskSecurity.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>
                      {t(`pia:confidentialityRiskSecurity.${item}`)}
                    </label>
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
            <FormLabel>{t(`pia:fields.confidentialityAssessment`)}</FormLabel>
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
