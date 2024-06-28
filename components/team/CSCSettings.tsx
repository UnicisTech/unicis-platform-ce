import { Card } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import { Subscription, Team } from '@prisma/client';
import { isoOptions } from '../defaultLanding/data/configs/csc';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse, TeamProperties, TeamWithSubscription } from 'types';
import * as Yup from 'yup';
import useSubscription from 'hooks/useSubscription';

const CSCSettings = ({ team }: { team: TeamWithSubscription }) => {
  console.log('CSCSettings team', team);
  const { avaliableISO } = useSubscription(team.subscription as Subscription);
  const { t } = useTranslation('common');

  const teamProperties = team.properties as TeamProperties;

  const formik = useFormik({
    initialValues: {
      iso: teamProperties.csc_iso || 'default',
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

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (isError) {
  //   return <Error />;
  // }

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
                  {isoOptions.map((option, index) => {
                    const isOptionDisabled: boolean = !avaliableISO.find(
                      (iso) => iso === option.value
                    );
                    return (
                      <option
                        value={option.value}
                        key={index}
                        disabled={isOptionDisabled}
                      >
                        {option.label}{' '}
                        {isOptionDisabled &&
                          ' - avaliable on Premium and Ultimate plans only'}
                      </option>
                    );
                  })}
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
