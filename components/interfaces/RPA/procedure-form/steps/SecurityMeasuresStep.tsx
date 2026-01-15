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
import { config } from '@/lib/rpa';
import type { SecurityMeasuresStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface SecurityMeasuresStepProps {
  control: Control<SecurityMeasuresStepValues>;
}

export function SecurityMeasuresStep({ control }: SecurityMeasuresStepProps) {
  const { t } = useTranslation('common');

  const tomsOptions = React.useMemo(() => config.toms.map(i => ({value: i, label: t(`rpa:toms.${i}`)})), [t])

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
          validate: (v: string[]) =>
            v && v.length > 0 ? undefined : t('please-select-at-least-one'),
          required: t('please-select-at-least-one'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.toms`)}</FormLabel>
            <FormControl>
              <MultiSelect
                options={tomsOptions}
                defaultValue={field.value}
                // onValueChange={(vals) =>
                //   field.onChange(mapOptions(config.toms, vals))
                // }
                onValueChange={field.onChange}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.toms ? (
              <FormDescription>
                {t('rpa:descriptions.multipleSelectionOther')}
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
