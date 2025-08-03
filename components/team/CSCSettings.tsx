import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { getAxiosError } from '@/lib/common';
import type { ApiResponse, TeamProperties, TeamWithSubscription } from 'types';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

interface CSCSettingsProps {
  team: TeamWithSubscription;
}

const CSCSettings: React.FC<CSCSettingsProps> = ({ team }) => {
  const { t } = useTranslation('common');
  const { avaliableISO } = useSubscription(team.subscription as Subscription);
  const teamProperties = team.properties as TeamProperties;

  const formik = useFormik({
    initialValues: {
      iso: teamProperties.csc_iso || isoOptions[0].value,
    },
    validationSchema: Yup.object({
      iso: Yup.string().required(t('choose-iso-required')),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        //TODO: handle uncorrect ISO selection
        await axios.put<ApiResponse<TeamProperties>>(
          `/api/teams/${team.slug}/csc/iso`,
          values
        );
        toast.success(t('successfully-updated'));
      } catch (err) {
        toast.error(getAxiosError(err));
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
          <div className="flex items-center space-x-3 w-1/2">
            <div className="flex-1">
              <Label htmlFor="iso" className="sr-only">
                {t('iso')}
              </Label>
              <Select
                name="iso"
                value={formik.values.iso}
                onValueChange={(val) => formik.setFieldValue('iso', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('select-iso')} />
                </SelectTrigger>
                <SelectContent>
                  {isoOptions.map(({ label, value }) => {
                    const disabled = !avaliableISO.includes(value);
                    return (
                      <SelectItem key={value} value={value} disabled={disabled}>
                        {label}
                        {disabled && (
                          <>
                            {' - '}
                            {subscriptionParams.ULTIMATE.avaliableISO.includes(
                              value
                            ) &&
                            !subscriptionParams.PREMIUM.avaliableISO.includes(
                              value
                            )
                              ? t('csc-ultimate only')
                              : t('csc-premium-and-ultimate only')}
                          </>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            >
              {formik.isSubmitting && <Loader2 className="animate-spin" />}
              {t('choose')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CSCSettings;
