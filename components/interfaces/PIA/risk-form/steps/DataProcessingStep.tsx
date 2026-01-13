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
import { DataProcessingStepValues } from '../types';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/pia';

const DataProcessingStep = ({
  initial,
  control,
}: {
  initial: PiaRisk[0] | null | undefined;
  control: Control<DataProcessingStepValues>;
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <p>{t('is-data-processing-necessary-and-proportional-question')}</p>

      <FormField
        control={control}
        name="isDataProcessingNecessary"
        rules={{ required: t('please-select-an-option') }}
        defaultValue={initial?.isDataProcessingNecessary ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.isDataProcessingNecessary`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.isDataProcessingNecessary.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(`pia:isDataProcessingNecessary.${item}`)}</label>
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
              {t(`pia:fields.isDataProcessingNecessaryAssessment`)}
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
        rules={{ required: t('please-select-an-option') }}
        defaultValue={initial?.isProportionalToPurpose ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.isProportionalToPurpose`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.isProportionalToPurpose.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(`pia:isProportionalToPurpose.${item}`)}</label>
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
              {t(`pia:fields.isProportionalToPurposeAssessment`)}
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
};

export default DataProcessingStep;
