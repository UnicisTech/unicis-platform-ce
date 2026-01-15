import * as React from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
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
import type { TransferScenarioStepValues } from '../types';
import { DatePickerInput } from '@/components/shadcn/ui/date-picker';
import { Message } from '@/components/shared';
import { countries } from '@/lib/common';

interface TransferScenarioStepProps {
  control: Control<TransferScenarioStepValues>;
}

export default function TransferScenarioStep({
  control,
}: TransferScenarioStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Message text={t('tia:descriptions.toBeCompletedByExporter')} />

      {/* Data Exporter */}
      <FormField
        control={control}
        name="DataExporter"
        rules={{ required: t('please-specify-the-data-exporter') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.DataExporter`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.dataExportersOrSender')}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Country of Data Exporter */}
      <FormField
        control={control}
        name="CountryDataExporter"
        rules={{ required: t('please-select-a-country') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.CountryDataExporter`)}</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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

      {/* Data Importer */}
      <FormField
        control={control}
        name="DataImporter"
        rules={{ required: t('please-specify-the-data-importer') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.DataImporter`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.dataImportersOrReceiver')}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Country of Data Importer */}
      <FormField
        control={control}
        name="CountryDataImporter"
        rules={{ required: t('please-select-a-country') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.CountryDataImporter`)}</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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

      {/* Transfer Scenario */}
      <FormField
        control={control}
        name="TransferScenario"
        rules={{ required: t('please-describe-the-transfer-scenario') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.TransferScenario`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.transferScenario')}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Data At Issue */}
      <FormField
        control={control}
        name="DataAtIssue"
        rules={{ required: t('please-describe-the-data-at-issue') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.DataAtIssue`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.dataAtIssue')}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* How Data Is Transferred */}
      <FormField
        control={control}
        name="HowDataTransfer"
        rules={{ required: t('please-describe-how-data-is-transferred') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.HowDataTransfer`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.dataTransferHow')}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Start Date of Assessment */}
      <FormField
        control={control}
        name="StartDateAssessment"
        rules={{ required: t('please-select-a-date') }}
        // defaultValue={initial?.StartDateAssessment?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
        render={({ field, formState }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.StartDateAssessment`)}</FormLabel>
            <FormControl>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('tia:placeholders.selectDate')}
                error={formState.errors.StartDateAssessment?.message}
                isModal
              />
            </FormControl>
            <FormMessage />
            <FormDescription>{t('tia:descriptions.selectStartDate')}</FormDescription>
          </FormItem>
        )}
      />

      {/* Assessment Period */}
      <FormField
        control={control}
        name="AssessmentYears"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.AssessmentYears`)}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                min={1}
                max={10}
                step={1}
              />
            </FormControl>
            <FormDescription>
              {`${field.value} year${field.value > 1 ? 's' : ''}`}
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Law Importer Country */}
      <FormField
        control={control}
        name="LawImporterCountry"
        rules={{ required: t('please-select-a-country') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.LawImporterCountry`)}</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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
              {t('tia:descriptions.legalAnalysisLawfulAccessLaws')}
            </FormDescription>
          </FormItem>
        )}
      />
    </>
  );
}
