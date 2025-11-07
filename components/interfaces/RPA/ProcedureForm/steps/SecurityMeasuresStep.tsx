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
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { Option } from 'types';
import type { SecurityMeasuresStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface SecurityMeasuresStepProps {
  control: Control<SecurityMeasuresStepValues>;
}

export function SecurityMeasuresStep({ control }: SecurityMeasuresStepProps) {
  const { t } = useTranslation('common');

  const mapOptions = (opts: Option[], vals: string[]): Option[] =>
    opts.filter((o) => vals.includes(o.value));

  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            {t('secure-your-data')}
            <br />- {t('ensure-integrity-minimize-risk')}
            <br />- {t('measures-depend-on-sensitiveness-and-risks')}
            <br />- {t('various-actions-antivirus-passwords-encrypting')}
          </span>
        }
      />

      <FormField
        control={control}
        name="toms"
        rules={{
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : t('please-select-at-least-one'),
          required: t('please-select-at-least-one'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.toms}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.toms}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.toms, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.toms ? (
              <FormDescription>
                {t(
                  'multiple-selection-possible-and-if-others-please-specify-on-the-ticket'
                )}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.toms?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <Message
        appearance="warning"
        text={t('please-attach-security-certification-documents-to-task')}
      />
    </>
  );
}
