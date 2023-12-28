import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import { useFormik } from 'formik';
import useSubscription from 'hooks/useSubscription';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import * as Yup from 'yup';

const availableSubscription = [
  {
    id: 1,
    name: 'Community',
  },
  {
    id: 2,
    name: 'Premium',
  },
  {
    id: 3,
    name: 'Ultimate',
  },
];

const Billing = ({ team }: { team: Team }) => {
  const { subscription } = useSubscription(team.slug);
  const { t } = useTranslation('common');

  console.log('Billing team', { team, subscription });

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
    onSubmit: async () => {
      // try {
      //   const response = await axios.put<ApiResponse<Team>>(
      //     `/api/teams/${team.slug}`,
      //     {
      //       ...values,
      //     }
      //   );
      //   const { data: teamUpdated } = response.data;
      //   if (teamUpdated) {
      //     toast.success(t('successfully-updated'));
      //     return router.push(`/teams/${teamUpdated.slug}/settings`);
      //   }
      // } catch (error: any) {
      //   toast.error(getAxiosError(error));
      // }
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
                {/* <Input
                name="email"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.email}
                placeholder="jackson@boxyhq.com"
                required
              /> */}
                <select
                  className="select-bordered select flex-grow"
                  name="subscription"
                  onChange={formik.handleChange}
                  required
                >
                  {availableSubscription.map((role) => (
                    <option value={role.id} key={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <Button
                  //type="submit"
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
          {/* <AccessControl resource="team" actions={['update']}>
            <Card.Footer>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  loading={formik.isSubmitting}
                  disabled={!formik.isValid || !formik.dirty}
                  size="md"
                >
                  {t('save-changes')}
                </Button>
              </div>
            </Card.Footer>
          </AccessControl> */}
        </Card>
      </form>
    </>
  );
};

export default Billing;
