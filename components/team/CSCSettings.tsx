import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import type { TeamProperties, TeamWithSubscription } from 'types';
import { Subscription } from '@prisma/client';
import useSubscription, { subscriptionParams } from 'hooks/useSubscription';
import { isoOptions } from '../defaultLanding/data/configs/csc';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/shadcn/ui/card';
import { Label } from '@/components/shadcn/ui/label';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

interface CSCSettingsProps {
  team: TeamWithSubscription;
}

const CSCSettings: React.FC<CSCSettingsProps> = ({ team }) => {
  const { t } = useTranslation('common');
  const { avaliableISO } = useSubscription(team.subscription as Subscription);
  const teamProperties = team.properties as TeamProperties;

  const frameworkOptions = isoOptions.map((option) => {
    const isDisabled = !avaliableISO.includes(option.value);
    const message = isDisabled
      ? ` - ${
          subscriptionParams.ULTIMATE.avaliableISO.includes(option.value) &&
          !subscriptionParams.PREMIUM.avaliableISO.includes(option.value)
            ? t('csc-ultimate only')
            : t('csc-premium-and-ultimate only')
        }`
      : null;

    return {
      ...option,
      ...(isDisabled
        ? { isDisabled: isDisabled, label: option.label + message }
        : {}),
    };
  });

  const formik = useFormik({
    initialValues: {
      iso: teamProperties.csc_iso,
    },
    validationSchema: Yup.object({
      iso: Yup.array(Yup.string().oneOf(isoOptions.map((o) => o.value)))
        .min(1, t('choose-iso-required'))
        .required(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // TODO: handle incorrect ISO selection
        const res = await fetch(`/api/teams/${team.slug}/csc/iso`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const { error } = await res.json().catch(() => ({}));
          throw new Error(error?.message || 'Request failed');
        }

        toast.success(t('successfully-updated'));
      } catch (err: any) {
        toast.error(err?.message || 'Unexpected error');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('csc-settings')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>{t('csc-choose-iso')}</p>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="iso" className="sr-only">
                {t('iso')}
              </Label>
              <MultiSelect
                name="iso"
                options={frameworkOptions}
                value={formik.values.iso}
                onValueChange={(value: string[]) => {
                  formik.setFieldValue('iso', value);
                  formik.setFieldTouched('iso', true, false);
                }}
                defaultValue={teamProperties.csc_iso}
              />
            </div>
            <div className="items-center pt-0 flex justify-end">
              <Button
                type="submit"
                disabled={
                  !formik.isValid || !formik.dirty || formik.isSubmitting
                }
              >
                {formik.isSubmitting && <Loader2 className="animate-spin" />}
                {t('choose')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CSCSettings;
