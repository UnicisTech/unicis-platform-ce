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
  const { t } = useTranslation(['common', 'tia']);
  const { getValues } = useFormContext();
  const values = getValues();

  const status = getTransferIsValue(values);

  const variant = status === 'not-permitted' ? 'error' : 'success';

  return (
    <div className="flex items-center space-x-2">
      <span className="font-bold">
        {t('tia:descriptions.transferIsLabel')}{' '}
        <DaisyBadge color={variant}>
          {t(`tia:transfer-is.${status}`)}
        </DaisyBadge>
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
  const { t } = useTranslation(['common', 'tia']);

  return (
    <>
      <Message text={t('tia:descriptions.toBeCompletedByExporter')} />

      {/* Encryption in Transit */}
      <FormField
        control={control}
        name="EncryptionInTransit"
        rules={{ required: t('errors.selectYesOrNo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.EncryptionInTransit`)}</FormLabel>
            <FormDescription>
              {t('tia:descriptions.encryptionInTransit')}
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
        rules={{ required: t('errors.enterAReason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonEncryptionInTransit`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.provideDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Transfer Mechanism */}
      <FormField
        control={control}
        name="TransferMechanism"
        rules={{ required: t('errors.selectYesOrNo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.TransferMechanism`)}</FormLabel>
            <FormDescription>
              {t('tia:descriptions.transferMechanism')}
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
        rules={{ required: t('errors.enterAReason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonTransferMechanism`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.provideDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Message
        appearance="warning"
        text={t('tia:descriptions.ifAnswerNoEnterSafeguardDetails')}
      />

      <p className="font-bold">
        {t('tia:descriptions.lawfulAccessCompatible')}
      </p>

      {/* Lawful Access */}
      <FormField
        control={control}
        name="LawfulAccess"
        rules={{ required: t('errors.selectYesOrNo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.LawfulAccess`)}</FormLabel>
            <FormDescription>
              {t('tia:descriptions.lawfulAccessTargeted')}
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
        rules={{ required: t('errors.enterAReason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.ReasonLawfulAccess`)}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.provideDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Mass Surveillance */}
      <FormField
        control={control}
        name="MassSurveillanceTelecommunications"
        rules={{ required: t('errors.selectYesOrNo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.MassSurveillanceTelecommunications`)}
            </FormLabel>
            <FormDescription>
              {t('tia:descriptions.massSurveillanceTelecommunications')}
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
        rules={{ required: t('errors.enterAReason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ReasonMassSurveillanceTelecommunications`)}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.provideDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Self-Reporting Obligations */}
      <FormField
        control={control}
        name="SelfReportingObligations"
        rules={{ required: t('errors.selectYesOrNo') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t(`tia:fields.SelfReportingObligations`)}</FormLabel>
            <FormDescription>
              {t('tia:descriptions.selfReportingObligations')}
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
        rules={{ required: t('errors.enterAReason') }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(`tia:fields.ReasonSelfReportingObligations`)}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t('tia:placeholders.provideDetails')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TransferIs />
    </>
  );
}
