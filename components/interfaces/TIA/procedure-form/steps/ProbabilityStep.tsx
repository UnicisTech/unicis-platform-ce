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
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import type { ProbabilityStepValues } from '../types';
import { Message } from '@/components/shared';
import { Input } from '@/components/shadcn/ui/input';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { TiaProcedureInterface } from 'types';
import { useTranslation } from 'next-i18next';
import { config, questions } from '@/lib/tia';

interface ProbabilityStepProps {
  problematicLawfulAccessValues: TiaProcedureInterface[1];
  riskValues: TiaProcedureInterface[2];
  control: Control<ProbabilityStepValues>;
}

export default function ProbabilityStep({
  control,
  problematicLawfulAccessValues,
  riskValues,
}: ProbabilityStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Message text={t('tia:descriptions.toBeCompletedByExporter')} />
      <Message
        text={t('tia:descriptions.problematicLawfulAccessDerogations')}
      />

      <p>{t(`tia:questions.${questions[0]}`)}</p>

      <FormField
        control={control}
        name="RelevantDataTransferImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.RelevantDataTransferImporter`)}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder={t('tia:placeholders.relevantDataTransferDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ProbabilityDataTransferImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ProbabilityDataTransferImporter`)}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder={t('tia:placeholders.probabilityHighLow')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ReasonDataTransferImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonDataTransferImporter`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                autoComplete="off"
                placeholder={t(
                  'tia:placeholders.reasoningDataTransferProbability'
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p>{t(`tia:questions.${questions[1]}`)}</p>

      <FormField
        control={control}
        name="RelevantTransferToImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.RelevantTransferToImporter`)}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ProbabilityTransferToImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ProbabilityTransferToImporter`)}
            </FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ReasonTransferToImporter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonTransferToImporter`)}</FormLabel>
            <FormControl>
              <Textarea {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p>{t(`tia:questions.${questions[2]}`)}</p>

      <FormField
        control={control}
        name="RelevantTransferToImporterForPerformance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.RelevantTransferToImporterForPerformance`)}
            </FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ProbabilityTransferToImporterPerformance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ProbabilityTransferToImporterPerformance`)}
            </FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ReasonTransferToImporterPerformance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ReasonTransferToImporterPerformance`)}
            </FormLabel>
            <FormControl>
              <Textarea {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p>{t(`tia:questions.${questions[3]}`)}</p>

      <FormField
        control={control}
        name="RelevantLegalGround"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.RelevantLegalGround`)}</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder={t('tia:placeholders.legalGround')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ProbabilityLegalGround"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ProbabilityLegalGround`)}</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder={t('tia:placeholders.probabilityHighLow')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ReasonLegalGround"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonLegalGround`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                autoComplete="off"
                placeholder={t('tia:placeholders.reasoningLegalGround')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p className="font-bold">
        {t('tia:descriptions.importerHasReasonToExpect')}
      </p>

      <p>
        <span>
          {t('tia:descriptions.problematicTargetedLawfulAccessQuestion')}
          {riskValues.DataIssueInvestigation === '2' ? (
            <DaisyBadge appearance="added">{t('yes')}</DaisyBadge>
          ) : (
            <DaisyBadge appearance="removed">{t('no')}</DaisyBadge>
          )}
        </span>
      </p>

      <p>
        <span>
          {t('tia:descriptions.problematicMassSurveillanceQuestion')}
          {riskValues.PassMassSurveillanceConnection === '4' ? (
            <DaisyBadge appearance="added">{t('yes')}</DaisyBadge>
          ) : (
            <DaisyBadge appearance="removed">{t('no')}</DaisyBadge>
          )}
        </span>
      </p>

      <p>
        <span>
          {t('tia:descriptions.problematicSelfReportingQuestion')}
          {riskValues.AssessmentProduceReport === '4' ? (
            <DaisyBadge appearance="added">{t('yes')}</DaisyBadge>
          ) : (
            <DaisyBadge appearance="removed">{t('no')}</DaisyBadge>
          )}
        </span>
      </p>

      <Message text={t('tia:descriptions.exporterBeliefNoDerogations')} />

      {problematicLawfulAccessValues.LawfulAccess === 'no' && (
        <>
          <FormField
            control={control}
            name="ConnectionTargetedAccess"
            rules={{ required: t('errors.pleaseSelectAnOption') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ConnectionTargetedAccess`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.targetedAccessInvestigations')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.ConnectionTargetedAccess.map((opt) => (
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
            name="ReasonConnectionTargetedAccess"
            rules={{ required: t('errors.pleaseProvideAReason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonConnectionTargetedAccess`)}
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
        </>
      )}

      {problematicLawfulAccessValues.MassSurveillanceTelecommunications ===
        'no' && (
        <>
          <FormField
            control={control}
            name="ConnectionSurveillanceTele"
            rules={{ required: t('errors.pleaseSelectAnOption') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ConnectionSurveillanceTele`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.intelligenceAgenciesExample')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.ConnectionSurveillanceTele.map((opt) => (
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
            name="ReasonConnectionSurveillanceTele"
            rules={{ required: t('errors.pleaseProvideAReason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonConnectionSurveillanceTele`)}
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
        </>
      )}
      {problematicLawfulAccessValues.SelfReportingObligations === 'no' && (
        <>
          <FormField
            control={control}
            name="ConnectionSelfreportingObligations"
            rules={{ required: t('errors.pleaseSelectAnOption') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ConnectionSelfreportingObligations`)}
                </FormLabel>
                <FormDescription>
                  {t('tia:descriptions.intelligenceAgenciesExample')}
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {config.ConnectionSelfreportingObligations.map((opt) => (
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
            name="ReasonConnectionSelfreportingObligations"
            rules={{ required: t('errors.pleaseProvideAReason') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(`tia:fields.ReasonConnectionSelfreportingObligations`)}
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
        </>
      )}
    </>
  );
}
