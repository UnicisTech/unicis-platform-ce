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
import { CorrectiveMeasuresStepValues } from '../types';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/pia';

const CorrectiveMeasuresStep = ({
  initial,
  control,
}: {
  initial?: PiaRisk[4];
  control: Control<CorrectiveMeasuresStepValues>;
}) => {
  const { t } = useTranslation('common');

  return (
    <>
      <p>{t('corrective-measures')}</p>

      {/* Guarantees textarea */}
      <FormField
        control={control}
        name="guarantees"
        defaultValue={initial?.guarantees ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.guarantees`)}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security Measures textarea */}
      <FormField
        control={control}
        name="securityMeasures"
        defaultValue={initial?.securityMeasures ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.securityMeasures`)}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Security Compliance textarea */}
      <FormField
        control={control}
        name="securityCompliance"
        defaultValue={initial?.securityCompliance ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.securityCompliance`)}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dealing With Residual Risk */}
      <FormField
        control={control}
        name="dealingWithResidualRisk"
        rules={{ required: t('please-select-an-option') }}
        defaultValue={initial?.dealingWithResidualRisk ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`pia:fields.dealingWithResidualRisk`)}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.dealingWithResidualRisk.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(`pia:dealingWithResidualRisk.${item}`)}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Residual Risk Assessment */}
      <FormField
        control={control}
        name="dealingWithResidualRiskAssessment"
        defaultValue={initial?.dealingWithResidualRiskAssessment ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`pia:fields.dealingWithResidualRiskAssessment`)}
            </FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Supervisory Authority Involvement */}
      <FormField
        control={control}
        name="supervisoryAuthorityInvolvement"
        rules={{ required: t('please-select-an-option') }}
        defaultValue={initial?.supervisoryAuthorityInvolvement ?? ''}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`pia:fields.supervisoryAuthorityInvolvement`)}
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.supervisoryAuthorityInvolvement.map(item => (
                  <div key={item} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={item} />
                    <label htmlFor={item}>{t(item)}</label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CorrectiveMeasuresStep;
