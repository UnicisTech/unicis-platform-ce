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
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { Option } from 'types';
import type { TransferStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface TransferStepProps {
  control: Control<TransferStepValues>;
}

export default function TransferStep({ control }: TransferStepProps) {
  const { t } = useTranslation('common');

  // helper to map strings back to objects
  const mapOptions = (opts: Option[], vals: string[]): Option[] =>
    opts.filter((o) => vals.includes(o.value));

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
              {fieldPropsMapping.datatransfer}
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipient"
        rules={{ required: t('please-enter-a-recipient') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipient}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
            <FormDescription>{t('recipient-description')}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="country"
        rules={{ required: t('please-select-a-country') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.country}</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = config.country.find((c) => c.value === val)!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-a-country')} />
                </SelectTrigger>
                <SelectContent>
                  {config.country.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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
          validate: (v: Option[]) =>
            v && v.length > 0 ? undefined : t('please-select-at-least-one'),
          required: t('please-select-at-least-one'),
        }}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.guarantee}</FormLabel>
            <FormControl>
              <MultiSelect
                options={config.guarantee}
                defaultValue={field.value.map((o) => o.value)}
                onValueChange={(vals) =>
                  field.onChange(mapOptions(config.guarantee, vals))
                }
                modalPopover={true}
              />
            </FormControl>
            {!formState.errors.guarantee ? (
              <FormDescription>
                {t(
                  'multiple-selection-possible-and-if-none-please-specify-on-the-ticket'
                )}
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
