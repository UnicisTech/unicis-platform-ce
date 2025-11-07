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
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Slider } from '@/components/shadcn/ui/slider';
import useTeamMembers from 'hooks/useTeamMembers';
import { Error, Loading } from '@/components/shared';
import type { RiskAndImpactStepValues } from '../types';
import type { Option } from 'types';
import { useTranslation } from 'next-i18next';

export interface RiskAndImpactStepProps {
  control: Control<RiskAndImpactStepValues>;
}

export default function RiskAndImpactStep({ control }: RiskAndImpactStepProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { isLoading, isError, members } = useTeamMembers(slug as string);

  if (isLoading) return <Loading />;
  if (isError || !members) return <Error message={isError?.message} />;

  // build select options from team members
  const ownerOptions: Option[] = members.map(({ user }) => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <>
      <FormField
        control={control}
        name="Risk"
        rules={{ required: t('please-describe-the-risk') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('risk')}</FormLabel>
            <FormDescription>{t('risk-description')}</FormDescription>
            <FormControl>
              <Textarea {...field} placeholder={t('enter-risk-description')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="AssetOwner"
        rules={{ required: t('please-select-an-asset-owner') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('asset-owner')}</FormLabel>
            <FormControl>
              <Select
                value={field.value.value}
                onValueChange={(val) => {
                  const sel = ownerOptions.find((o) => o.value === val)!;
                  field.onChange(sel);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-an-owner')} />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>{t('asset-owner-description')}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="Impact"
        rules={{ required: t('please-describe-the-impact') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('impact')}</FormLabel>
            <FormDescription>{t('impact-description')}</FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('enter-impact-description')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="RawProbability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('raw-probability-percent')}</FormLabel>
            <FormDescription>
              {t('raw-probability-description')}
            </FormDescription>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>{`${field.value}% ${t('max-100')}`}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="RawImpact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('raw-impact')}</FormLabel>
            <FormDescription>{t('raw-impact-description')}</FormDescription>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={100}
                step={1}
              />
            </FormControl>
            <FormDescription>{`${field.value}% ${t('max-100')}`}</FormDescription>
          </FormItem>
        )}
      />
    </>
  );
}
