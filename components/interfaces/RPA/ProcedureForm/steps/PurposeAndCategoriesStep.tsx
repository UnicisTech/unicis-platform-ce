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
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { Option } from 'types';
import type { PurposeAndCategoriesStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface PurposeAndCategoriesStepProps {
  control: Control<PurposeAndCategoriesStepValues>;
}

export default function PurposeAndCategoriesStep({
  control,
}: PurposeAndCategoriesStepProps) {
  const { t } = useTranslation('common');

  // helper to map selected string values back to full objects
  const mapOptions = (allOpts: Option[], vals: string[]): Option[] =>
    allOpts.filter((o) => vals.includes(o.value));

  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            {t('processing-must-have-purpose')}
            <br />
            <em>{t('processing-purpose-example')}</em>
          </span>
        }
      />

      <FormField
        control={control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.purpose}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('describe-principles-to-processing')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        rules={{
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : t('please-select-a-categories'),
          required: t('please-select-a-categories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.category}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.category}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.category, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.category ? (
              <FormDescription>
                {t('multiple-selection-possible-for-personal-data')}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.category?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="specialcategory"
        rules={{
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : t('please-select-a-categories'),
          required: t('please-select-a-categories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.specialcategory}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.specialcategory}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.specialcategory, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.specialcategory ? (
              <FormDescription>
                {t('multiple-selection-possible')}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.specialcategory?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="datasubject"
        rules={{
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : t('please-select-a-categories'),
          required: t('please-select-a-categories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.datasubject}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.datasubject}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.datasubject, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.datasubject ? (
              <FormDescription>
                {t(
                  'multiple-selection-possible-and-if-others-please-specify-on-the-ticket'
                )}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.datasubject?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="retentionperiod"
        rules={{ required: t('please-select-a-period') }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.retentionperiod}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.retentionperiod}
                defaultValue={
                  field.value?.value ? [field.value?.value] : undefined
                }
                onValueChange={(vals) => {
                  const sel = config.retentionperiod.find(
                    (c) => c.value === vals[0]
                  )!;
                  field.onChange(sel);
                }}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.retentionperiod ? (
              <FormDescription>
                {t('please-specify-the-data-retention-period')}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.retentionperiod?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="commentsretention"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.commentsretention}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('retention-comments-placeholder')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
