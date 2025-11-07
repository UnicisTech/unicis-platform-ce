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

import { getTiaRisks, getProblematicLawfulAccesses } from '@/lib/tia';
import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/tia';
import type { TiaProcedureInterface } from 'types';
import type { RiskStepValues } from '../types';
import RiskLevel from '../../RiskLevel';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';

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
      <Message text={t('to-be-completed-by-the-importer')} />

      {problematicLawfulAccessValues.LawfulAccess === 'no' && (
        <>
          <Message text={t('targeted-lawful-access-description')} />

          <FormField
            control={control}
            name="WarrantsSubpoenas"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.WarrantsSubpoenas}</FormLabel>
                <FormDescription>
                  {t('warrants-subpoenas-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonWarrantsSubpoenas}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-your-reasoning-here')}
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
                <FormLabel>{fieldPropsMapping.ViolationLocalLaw}</FormLabel>
                <FormDescription>
                  {t('violation-local-law-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonViolationLocalLaw}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.HighViolationLocalLaw}</FormLabel>
                <FormDescription>
                  {t('high-violation-local-law-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonHighViolationLocalLaw}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                  {fieldPropsMapping.HighViolationDataIssue}
                </FormLabel>
                <FormDescription>
                  {t('high-violation-data-issue-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonHighViolationDataIssue}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.InvestigatingImporter}</FormLabel>
                <FormDescription>
                  {t('investigating-importer-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonInvestigatingImporter}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.PastWarrantSubpoena}</FormLabel>
                <FormDescription>
                  {t('past-warrant-subpoena-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonPastWarrantSubpoena}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                  {fieldPropsMapping.DataIssueInvestigation}
                </FormLabel>
                <FormDescription>
                  {t('data-issue-investigation-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonDataIssueInvestigation}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isDataIssueInvestigationProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('problematic-lawful-access-expected')}
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
            text={t('non-targeted-lawful-access-description')}
          />

          <FormField
            control={control}
            name="LocalIssueWarrants"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalIssueWarrants}</FormLabel>
                <FormDescription>
                  {t('local-issue-warrants-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonLocalIssueWarrants}
                </FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t('provide-details')} />
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
                <FormLabel>{fieldPropsMapping.LocalMassSurveillance}</FormLabel>
                <FormDescription>
                  {t('local-mass-surveillance-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonLocalMassSurveillance}
                </FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t('provide-details')} />
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
                  {fieldPropsMapping.LocalAccessMassSurveillance}
                </FormLabel>
                <FormDescription>
                  {t('local-access-mass-surveillance-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonLocalAccessMassSurveillance}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.LocalRoutinelyMonitor}</FormLabel>
                <FormDescription>
                  {t('local-routinely-monitor-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonLocalRoutinelyMonitor}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.PassMassSurveillance}</FormLabel>
                <FormDescription>
                  {t('pass-mass-surveillance-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonPassMassSurveillance}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                  {fieldPropsMapping.PassMassSurveillanceConnection}
                </FormLabel>
                <FormDescription>
                  {t('pass-mass-surveillance-connection-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonPassMassSurveillanceConnection}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isPassMassSurveillanceConnectionProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('problematic-lawful-access-expected')}
              </DaisyBadge>
            </p>
          )}
        </>
      )}

      {problematicLawfulAccessValues.SelfReportingObligations === 'no' && (
        <>
          <Message
            isBold={true}
            text={t('self-reporting-to-authorities-description')}
          />

          <FormField
            control={control}
            name="ImporterObligation"
            rules={{ required: t('please-select-an-option') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ImporterObligation}</FormLabel>
                <FormDescription>
                  {t('importer-obligation-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonImporterObligation}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.LocalSelfReporting}</FormLabel>
                <FormDescription>
                  {t('local-self-reporting-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonLocalSelfReporting}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                <FormLabel>{fieldPropsMapping.PastSelfReporting}</FormLabel>
                <FormDescription>
                  {t('past-self-reporting-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonPastSelfReporting}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
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
                  {fieldPropsMapping.AssessmentProduceReport}
                </FormLabel>
                <FormDescription>
                  {t('assessment-produce-report-description')}
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
                        <label htmlFor={opt.value}>{opt.label}</label>
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
                  {fieldPropsMapping.ReasonAssessmentProduceReport}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder={t('provide-details')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAssessmentProduceReportProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                {t('problematic-lawful-access-expected')}
              </DaisyBadge>
            </p>
          )}
        </>
      )}
    </>
  );
}
