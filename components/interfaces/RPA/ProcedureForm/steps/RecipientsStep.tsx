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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import type { RecipientsStepValues } from '../types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface RecipientsStepProps {
  control: Control<RecipientsStepValues>;
}

export default function RecipientsStep({ control }: RecipientsStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Message
        appearance="warning"
        text={
          <span>
            {t('list-all-persons-who-have-access-to-the-data')}
            <br />
            {t('for-example-recruitment-it-management-providers')}
          </span>
        }
      />

      <FormField
        control={control}
        name="recipientType"
        rules={{ required: t('please-select-a-type') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipientType}</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = config.recipientType.find(
                    (o) => o.value === val
                  )!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-recipient-type')} />
                </SelectTrigger>
                <SelectContent>
                  {config.recipientType.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              {t(
                'please-specify-type-of-recipient-if-not-on-list-specify-on-details'
              )}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipientdetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldPropsMapping.recipientdetails}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t(
                  'write-details-if-you-select-others-or-no-recipient-type-above'
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
