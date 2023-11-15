import { Card } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import { Team } from '@prisma/client';
import { isoOptions } from '../defaultLanding/data/configs/csc';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const CSCSettings = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const teamProperties = team.properties as any;

  const formik = useFormik({
    initialValues: {
      iso: (teamProperties.csc_iso as string) || 'default',
    },
    validationSchema: Yup.object().shape({
      iso: Yup.string().required('Choose ISO set'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await axios.put<ApiResponse<Team>>(
          `/api/teams/${team.slug}/csc/iso`,
          {
            ...values,
          }
        );

        const { data: iso } = response.data;
        if (iso) {
          toast.success(t('successfully-updated'));
        }
      } catch (error) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading={t('csc-settings')}>
          <Card.Body className="px-3 py-3">
            <div className="mt-2 flex flex-col space-y-4">
              <p>{t('csc-choose-iso')}</p>
              <div className="flex justify-between space-x-3 w-1/2 items-center">
                <select
                  className="select-bordered select flex-grow"
                  name="iso"
                  onChange={formik.handleChange}
                  value={formik.values.iso}
                  required
                >
                  {isoOptions.map((option, index) => (
                    <option value={option.value} key={index}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  color="primary"
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid || !formik.dirty}
                  size="md"
                >
                  {t('choose')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </form>
    </>
  );
};

export default CSCSettings;
