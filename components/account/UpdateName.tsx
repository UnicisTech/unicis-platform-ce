import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';

import type { ApiResponse, UserReturned } from 'types';
import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

const schema = Yup.object().shape({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
});

const UpdateName = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation('common');
  const { data: session, update } = useSession();

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<UserReturned>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: json.data.name,
          firstName: json.data.firstName,
          lastName: json.data.lastName,
        },
      });

      toast.success(t('successfully-updated'));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('name')}</Card.Title>
            <Card.Description>{t('name-appearance')}</Card.Description>
          </Card.Header>
          <InputWithLabel
            type="text"
            label={t('first-name')}
            name="firstName"
            placeholder={t('your-first-name')}
            value={formik.values.firstName}
            error={
              formik.touched.firstName ? formik.errors.firstName : undefined
            }
            onChange={formik.handleChange}
            required
          />
          <InputWithLabel
            type="text"
            label={t('last-name')}
            name="lastName"
            placeholder={t('your-last-name')}
            value={formik.values.lastName}
            error={formik.touched.lastName ? formik.errors.lastName : undefined}
            onChange={formik.handleChange}
            required
          />
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            disabled={!formik.dirty || !formik.isValid}
            size="md"
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateName;
