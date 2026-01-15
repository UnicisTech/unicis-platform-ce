import * as React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/shadcn/ui/form';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Slider } from '@/components/shadcn/ui/slider';
import type { RiskTreatmentStepValues } from '../types';
import { useTranslation } from 'next-i18next';

export interface RiskTreatmentStepProps {
  control: Control<RiskTreatmentStepValues>;
}

export default function RiskTreatmentStep({ control }: RiskTreatmentStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <FormField
        control={control}
        name="RiskTreatment"
        rules={{ required: t('describe-how-the-risk-is-to-be-treated') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rm:fields.RiskTreatment`)}</FormLabel>
            <FormDescription>
              {t('rm:descriptions.riskTreatment')}
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('rm:placeholders.treatmentApproach')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="TreatmentCost"
        rules={{ required: t('estimate-total-cost-of-mitigating-risk') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rm:fields.TreatmentCost`)}</FormLabel>
            <FormDescription>
              {t('estimate-total-cost-of-mitigating-risk')}
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('rm:placeholders.costEstimate')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="TreatmentStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('rm:form-labels.TreatmentStatus')}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>
              {t('rm:descriptions.treatmentStatus')}
            </FormDescription>
            <FormDescription>{`${field.value} ${t('percent-max-100')}`}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="TreatedProbability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('rm:form-labels.TreatedProbability')}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>
              {t('rm:descriptions.treatedProbability')}
            </FormDescription>
            <FormDescription>{`${field.value} ${t('percent-max-100')}`}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="TreatedImpact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('treated-impact-percent')}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>{t('rm:descriptions.treatedImpact')}</FormDescription>
            <FormDescription>{`${field.value} ${t('percent-max-100')}`}</FormDescription>
          </FormItem>
        )}
      />
    </>
  );
}
