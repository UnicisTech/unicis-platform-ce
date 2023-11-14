import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { User } from '@prisma/client';
import type { ApiResponse } from 'types';
import { InputWithLabel, Loading, Error } from '@/components/shared';
import useInvitation from 'hooks/useInvitation';

const JoinWithInvitation = ({
  inviteToken,
  next,
}: {
  inviteToken: string;
  next: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { isLoading, error, invitation } = useInvitation(inviteToken);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: invitation?.email,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      const { error }: ApiResponse<User> = await response.json();

      if (error) {
        toast.error(error.message);
        return;
      }

      formik.resetForm();
      toast.success(t('successfully-joined'));

      return next ? router.push(next) : router.push('/auth/login');
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <form className="space-y-3" onSubmit={formik.handleSubmit}>
      <InputWithLabel
        type="text"
        label="Name"
        name="name"
        placeholder="Your name"
        value={formik.values.name}
        error={formik.touched.name ? formik.errors.name : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="email"
        label="Email"
        name="email"
        placeholder="first.last@name.com"
        value={formik.values.email}
        error={formik.touched.email ? String(formik.errors.email) : undefined}
        onChange={formik.handleChange}
      />
      <Button
        type="submit"
        color="primary"
        loading={formik.isSubmitting}
        active={formik.dirty}
        fullWidth
      >
        {t('create-account')}
      </Button>
      <div>
        <p className="text-sm">{t('sign-up-message')}</p>
      </div>
    </form>
  );
};

export default JoinWithInvitation;
