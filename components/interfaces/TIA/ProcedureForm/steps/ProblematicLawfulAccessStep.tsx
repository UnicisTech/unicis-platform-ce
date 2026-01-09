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
import type { TiaProcedureInterface } from 'types';
import type { ProblematicLawfulAccessValues } from '../types';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { Message } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { config } from '@/lib/tia';
import { getTransferIsValue } from '@/lib/tia/helpers';

export function TransferIs() {
  const { t } = useTranslation('common');
  const { getValues } = useFormContext();
  const values = getValues();

  const status = getTransferIsValue(values);

  const variant = status === 'not-permitted' ? 'error' : 'success';

  return (
    <div className="flex items-center space-x-2">
      <span className="font-bold">
        {t('based-on-the-answers-transfer-is')}{' '}
        <DaisyBadge color={variant}>{t(`tia:transfer-is.${status}`)}</DaisyBadge>
      </span>
    </div>
  );
}

interface ProblematicLawfulAccessStepProps {
  initial?: TiaProcedureInterface[1];
  control: Control<ProblematicLawfulAccessValues>;
}

export default function ProblematicLawfulAccessStep({
  control,
}: ProblematicLawfulAccessStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Message text={t('to-be-completed-by-the-exporter')} />

      {/* Encryption in Transit */}
      <FormField
        control={control}
        name="EncryptionInTransit"
        rules={{ required: t('select-yes-or-no') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.EncryptionInTransit`)}</FormLabel>
            <FormDescription>
              {t('encryption-in-transit-description')}
            </FormDescription>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.EncryptionInTransit.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {/* Reason Encryption */}
      <FormField
        control={control}
        name="ReasonEncryptionInTransit"
        rules={{ required: t('enter-a-reason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonEncryptionInTransit`)}</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('provide-details')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Transfer Mechanism */}
      <FormField
        control={control}
        name="TransferMechanism"
        rules={{ required: t('select-yes-or-no') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.TransferMechanism`)}</FormLabel>
            <FormDescription>
              {t('transfer-mechanism-description')}
            </FormDescription>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.TransferMechanism.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {/* Reason Transfer Mechanism */}
      <FormField
        control={control}
        name="ReasonTransferMechanism"
        rules={{ required: t('enter-a-reason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonTransferMechanism`)}</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('provide-details')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Message
        appearance="warning"
        text={t(
          'if-answer-is-no-enter-details-into-eu-scc-or-similar-safeguard'
        )}
      />

      <p className="font-bold">
        {t('based-on-legal-analysis-lawful-access-laws-compatible')}
      </p>

      {/* Lawful Access */}
      <FormField
        control={control}
        name="LawfulAccess"
        rules={{ required: t('select-yes-or-no') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.LawfulAccess`)}</FormLabel>
            <FormDescription>
              {t('lawful-access-targeted-description')}
            </FormDescription>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.LawfulAccess.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {/* Reason Lawful Access */}
      <FormField
        control={control}
        name="ReasonLawfulAccess"
        rules={{ required: t('enter-a-reason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonLawfulAccess`)}</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('provide-details')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Mass Surveillance */}
      <FormField
        control={control}
        name="MassSurveillanceTelecommunications"
        rules={{ required: t('select-yes-or-no') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.MassSurveillanceTelecommunications`)}
            </FormLabel>
            <FormDescription>
              {t('mass-surveillance-telecommunications-description')}
            </FormDescription>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.MassSurveillanceTelecommunications.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {/* Reason Mass Surveillance */}
      <FormField
        control={control}
        name="ReasonMassSurveillanceTelecommunications"
        rules={{ required: t('enter-a-reason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ReasonMassSurveillanceTelecommunications`)}
            </FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('provide-details')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Self-Reporting Obligations */}
      <FormField
        control={control}
        name="SelfReportingObligations"
        rules={{ required: t('select-yes-or-no') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.SelfReportingObligations`)}</FormLabel>
            <FormDescription>
              {t('self-reporting-obligations-description')}
            </FormDescription>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {config.SelfReportingObligations.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {/* Reason Self-Reporting */}
      <FormField
        control={control}
        name="ReasonSelfReportingObligations"
        rules={{ required: t('enter-a-reason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ReasonSelfReportingObligations`)}
            </FormLabel>
            <FormControl>
              <Textarea {...field} placeholder={t('provide-details')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TransferIs />
    </>
  );
}
