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
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { config } from '@/lib/rpa';
import type { TransferStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { countries } from '@/lib/common';

export interface TransferStepProps {
  control: Control<TransferStepValues>;
}

export default function TransferStep({ control }: TransferStepProps) {
  const { t } = useTranslation('common');

  const guaranteeOptions = React.useMemo(() => config.guarantee.map(i => ({value: i, label: t(`rpa:guarantee.${i}`)})), [t])

  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            {t('when-you-transfer-data-outside-the-eu')} <br />-{' '}
            {t('check-whether-country-has-data-protection-legislation')} <br />-{' '}
            {t('a-map-of-the-world-presenting-data-protection-legislation')}{' '}
            <br />- {t('otherwise-provide-legal-framework-for-transfers')}
          </span>
        }
      />

      <FormField
        control={control}
        name="datatransfer"
        render={({ field }) => (
          <FormItem className="flex items-end space-x-2">
            <FormControl>
              <Checkbox
                id="datatransfer"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel htmlFor="datatransfer">
              {t(`rpa:fields.datatransfer`)}
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipient"
        rules={{ required: t('errors.pleaseEnterRecipient') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.recipient`)}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
            <FormDescription>{t('rpa:descriptions.recipient')}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="country"
        rules={{ required: t('errors.pleaseSelectCountry') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.country`)}</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-a-country')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {t(`country.${country}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              {t('please-select-from-the-list')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="guarantee"
        rules={{
          validate: (v: string[]) =>
            v && v.length > 0 ? undefined : t('errors.pleaseSelectAtLeastOne'),
          required: t('errors.pleaseSelectAtLeastOne'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.guarantee`)}</FormLabel>
            <FormControl>
              <MultiSelect
                options={guaranteeOptions}
                defaultValue={field.value}
                onValueChange={field.onChange}
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.guarantee ? (
              <FormDescription>
                {t('rpa:descriptions.multipleSelectionNone')}
              </FormDescription>
            ) : (
              <FormMessage>
                {String(formState.errors.guarantee?.message)}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      <Message
        appearance="warning"
        text={<span>{t('please-attach-relevant-documents-to-the-task')}</span>}
      />
    </>
  );
}
