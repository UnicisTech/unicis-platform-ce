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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { config } from '@/lib/rpa';
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

  const {
    categoryOptions,
    specialCategoryOptions,
    dataSubjectOptions,
    retentionPeriodOptions,
  } = React.useMemo(() => {
    const categoryOptions = config.category.map((i) => ({
      value: i,
      label: t(`rpa:category.${i}`),
    }));
    const specialCategoryOptions = config.specialCategory.map((i) => ({
      value: i,
      label: t(`rpa:special-category.${i}`),
    }));
    const dataSubjectOptions = config.dataSubject.map((i) => ({
      value: i,
      label: t(`rpa:data-subject.${i}`),
    }));
    const retentionPeriodOptions = config.retentionPeriod.map((i) => ({
      value: i,
      label: t(`rpa:retention-period.${i}`),
    }));

    return {
      categoryOptions,
      specialCategoryOptions,
      dataSubjectOptions,
      retentionPeriodOptions,
    };
  }, [t]);

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
            <FormLabel>{t(`rpa:fields.purpose`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('rpa:placeholders.processingPrinciples')}
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
          validate: (v: string[]) =>
            v && v.length > 0 ? undefined : t('errors.pleaseSelectCategories'),
          required: t('errors.pleaseSelectCategories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.category`)}</FormLabel>
            <FormControl>
              <MultiSelect
                options={categoryOptions}
                defaultValue={field.value}
                onValueChange={field.onChange}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.category ? (
              <FormDescription>
                {t('rpa:descriptions.multipleSelectionPersonalData')}
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
          validate: (v: string[]) =>
            v && v.length > 0 ? undefined : t('errors.pleaseSelectCategories'),
          required: t('errors.pleaseSelectCategories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.specialcategory`)}</FormLabel>
            <FormControl>
              <MultiSelect
                options={specialCategoryOptions}
                defaultValue={field.value}
                onValueChange={field.onChange}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.specialcategory ? (
              <FormDescription>
                {t('rpa:descriptions.multipleSelection')}
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
          validate: (v: string[]) =>
            v && v.length > 0 ? undefined : t('errors.pleaseSelectCategories'),
          required: t('errors.pleaseSelectCategories'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.datasubject`)}</FormLabel>
            <FormControl>
              <MultiSelect
                options={dataSubjectOptions}
                defaultValue={field.value}
                onValueChange={field.onChange}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.datasubject ? (
              <FormDescription>
                {t('rpa:descriptions.multipleSelectionOther')}
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
        rules={{ required: t('rpa:placeholders.retentionPeriod') }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t('rpa:fields.retentionperiod')}</FormLabel>
            <FormControl>
              <Select
                value={field.value ?? ''}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('rpa:placeholders.retentionPeriod')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {retentionPeriodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            {!formState.errors.retentionperiod ? (
              <FormDescription>
                {t('rpa:descriptions.retentionPeriod')}
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
            <FormLabel>{t(`rpa:fields.commentsretention`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('rpa:placeholders.retentionComments')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
