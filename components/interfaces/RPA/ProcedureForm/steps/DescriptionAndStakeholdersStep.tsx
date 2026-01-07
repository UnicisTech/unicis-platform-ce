import * as React from 'react';
import { useRouter } from 'next/router';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/shadcn/ui/form';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { DatePickerInput } from '@/components/shadcn/ui/date-picker';
import useTeamMembers from 'hooks/useTeamMembers';
import { Loading, Error } from '@/components/shared';
import type { DescriptionAndStakeholdersStepValues } from '../types';
import type { Option } from 'types';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

export interface DescriptionAndStakeholdersStepProps {
  control: Control<DescriptionAndStakeholdersStepValues>;
}

export default function DescriptionAndStakeholdersStep({
  control,
}: DescriptionAndStakeholdersStepProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { isLoading, isError, members } = useTeamMembers(slug as string);

  if (isLoading) {
    return <Loading />;
  }
  if (isError || !members) {
    return <Error message={isError?.message} />;
  }

  const dpoOptions: Option[] = members.map(({ user }) => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <>
      <Message text={t('personal-data-processing-definition')} />

      <FormField
        control={control}
        name="reviewDate"
        rules={{ required: t('please-select-a-due-date') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('review-date')}</FormLabel>
            <FormControl>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('select-date')}
                isModal
              />
            </FormControl>
            <FormDescription>{t('specify-future-review-date')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="controller"
        rules={{ required: t('please-enter-the-controller') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('controller')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder={t('enter-controller-name')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="dpo"
        rules={{ required: t('please-select-a-dpo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('data-protection-officer')}</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-a-dpo')} />
                </SelectTrigger>
                <SelectContent>
                  {dpoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
