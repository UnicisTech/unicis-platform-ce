import { Card, InputWithLabel } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import { Team } from '@prisma/client';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const availableSubscription = [
  {
    id: 1,
    name: "Pre-Seed"
  },
  {
    id: 2,
    name: "Growth"
  },
  {
    id: 3,
    name: "Scale"
  },
]

const Billing = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain,
    },
    validationSchema: Yup.object().shape({
      subscription: Yup.string().required('Choose a subscription'),
      slug: Yup.string().required('Slug is required'),
      domain: Yup.string().nullable(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {

    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading={t('team-subscription')}>
          <Card.Body className="px-3 py-3">
            <div className="mt-2 flex flex-col space-y-4">
              <p>{t('choose-subscription-message')}</p>
              <div className="flex justify-between space-x-3 w-1/2 items-center">
                <select
                  className="select-bordered select flex-grow"
                  name="subscription"
                  onChange={formik.handleChange}
                  required
                >
                  <option value={"Unicis Platform CE"} key={1}>
                    Unicis Platform CE
                  </option>
                  {/* {availableSubscription.map((role) => (
                    <option value={role.id} key={role.id}>
                      {role.name}
                    </option>
                  ))} */}
                </select>
                <Button
                  color="primary"
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid}
                  size="md"
                >
                  {t('subscribe')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </form>
    </>
  );
};

export default Billing;
