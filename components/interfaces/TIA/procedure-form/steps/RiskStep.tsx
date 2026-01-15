import * as React from 'react';
import { Control, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/shadcn/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import { Textarea } from '@/components/shadcn/ui/textarea';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';

import { getTiaRisks, getProblematicLawfulAccesses } from '@/lib/tia/helpers';
import type { TiaProcedureInterface } from 'types';
import type { RiskStepValues } from '../types';
import RiskLevel from '../../RiskLevel';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/tia';

interface RiskStepProps {
  problematicLawfulAccessValues: TiaProcedureInterface[1];
  control: Control<RiskStepValues>;
}

export default function RiskStep({
  problematicLawfulAccessValues,
  control,
}: RiskStepProps) {
  const { t } = useTranslation('common');

  const { getValues } = useFormContext();
  const values = getValues();

  const { targetedRisk, nonTargetedRisk, selfReportingRisk } =
    getTiaRisks(values);
  const {
    isDataIssueInvestigationProblematic,
    isPassMassSurveillanceConnectionProblematic,
    isAssessmentProduceReportProblematic,
  } = getProblematicLawfulAccesses(values);
  return (
    <>
      <Message text={t('tia:descriptions.toBeCompletedByImporter')} />

      {problematicLawfulAccessValues.LawfulAccess === 'no' && (
        <>
          <Message text={t('tia:descriptions.targetedLawfulAccess')} />

          <FormField
            control={control}
            name="WarrantsSubpoenas"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.WarrantsSubpoenas`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.warrantsSubpoenas')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.WarrantsSubpoenas.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonWarrantsSubpoenas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonWarrantsSubpoenas`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.reasoningHere')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ViolationLocalLaw"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.ViolationLocalLaw`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.violationLocalLaw')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.ViolationLocalLaw.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonViolationLocalLaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonViolationLocalLaw`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="HighViolationLocalLaw"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.HighViolationLocalLaw`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.highViolationLocalLaw')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.HighViolationLocalLaw.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonHighViolationLocalLaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonHighViolationLocalLaw`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="HighViolationDataIssue"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.HighViolationDataIssue`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.highViolationDataIssue')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.HighViolationDataIssue.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonHighViolationDataIssue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonHighViolationDataIssue`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="InvestigatingImporter"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.InvestigatingImporter`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.investigatingImporter')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.InvestigatingImporter.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonInvestigatingImporter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonInvestigatingImporter`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="PastWarrantSubpoena"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.PastWarrantSubpoena`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.pastWarrantSubpoena')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.PastWarrantSubpoena.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonPastWarrantSubpoena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonPastWarrantSubpoena`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <RiskLevel value={targetedRisk} />

          <FormField
            control={control}
            name="DataIssueInvestigation"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.DataIssueInvestigation`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.dataIssueInvestigation')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.DataIssueInvestigation.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonDataIssueInvestigation"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonDataIssueInvestigation`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isDataIssueInvestigationProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('tia:descriptions.problematicLawfulAccessExpected')}
              </DaisyBadge>
            </p>
          )}
        </>
      )}

      {problematicLawfulAccessValues.MassSurveillanceTelecommunications ===
        'no' && (
        <>
          <Message
            isBold={true}
            text={t('tia:descriptions.nonTargetedLawfulAccess')}
          />

          <FormField
            control={control}
            name="LocalIssueWarrants"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.LocalIssueWarrants`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.localIssueWarrants')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.LocalIssueWarrants.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonLocalIssueWarrants"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonLocalIssueWarrants`)}
                </FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t('tia:placeholders.provideDetails')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalMassSurveillance"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.LocalMassSurveillance`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.localMassSurveillance')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.LocalMassSurveillance.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonLocalMassSurveillance"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonLocalMassSurveillance`)}
                </FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t('tia:placeholders.provideDetails')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalAccessMassSurveillance"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.LocalAccessMassSurveillance`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.localAccessMassSurveillance')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.LocalAccessMassSurveillance.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonLocalAccessMassSurveillance"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonLocalAccessMassSurveillance`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalRoutinelyMonitor"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.LocalRoutinelyMonitor`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.localRoutinelyMonitor')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.LocalRoutinelyMonitor.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonLocalRoutinelyMonitor"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonLocalRoutinelyMonitor`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="PassMassSurveillance"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.PassMassSurveillance`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.passMassSurveillance')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.PassMassSurveillance.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonPassMassSurveillance"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonPassMassSurveillance`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <RiskLevel value={nonTargetedRisk} />

          <FormField
            control={control}
            name="PassMassSurveillanceConnection"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.PassMassSurveillanceConnection`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.passMassSurveillanceConnection')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.PassMassSurveillanceConnection.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonPassMassSurveillanceConnection"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonPassMassSurveillanceConnection`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isPassMassSurveillanceConnectionProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('tia:descriptions.problematicLawfulAccessExpected')}
              </DaisyBadge>
            </p>
          )}
        </>
      )}

      {problematicLawfulAccessValues.SelfReportingObligations === 'no' && (
        <>
          <Message
            isBold={true}
            text={t('tia:descriptions.selfReportingToAuthorities')}
          />

          <FormField
            control={control}
            name="ImporterObligation"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.ImporterObligation`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.importerObligation')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.ImporterObligation.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonImporterObligation"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonImporterObligation`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalSelfReporting"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.LocalSelfReporting`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.localSelfReporting')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.LocalSelfReporting.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonLocalSelfReporting"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonLocalSelfReporting`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="PastSelfReporting"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`tia:fields.PastSelfReporting`)}</FormLabel>
                <FormDescription>
                  {t('tia:descriptions.pastSelfReporting')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.PastSelfReporting.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonPastSelfReporting"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonPastSelfReporting`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <RiskLevel value={selfReportingRisk} />

          <FormField
            control={control}
            name="AssessmentProduceReport"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.AssessmentProduceReport`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.assessmentProduceReport')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.AssessmentProduceReport.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value}>{t(opt.key)}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ReasonAssessmentProduceReport"
            rules={{ required: t('please-provide-a-reason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonAssessmentProduceReport`)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('tia:placeholders.provideDetails')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAssessmentProduceReportProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('tia:descriptions.problematicLawfulAccessExpected')}
              </DaisyBadge>
            </p>
          )}
        </>
      )}
    </>
  );
}
