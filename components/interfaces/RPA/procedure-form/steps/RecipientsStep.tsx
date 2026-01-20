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
import { config } from '@/lib/rpa';
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
        rules={{ required: t('errors.pleaseSelectType') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.recipientType`)}</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('rpa:placeholders.recipientType')} />
                </SelectTrigger>
                <SelectContent>
                  {config.recipientType.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(`rpa:recipient-type.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              {t('rpa:descriptions.recipientTypeDetails')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="recipientdetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`rpa:fields.recipientdetails`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('rpa:placeholders.recipientDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
