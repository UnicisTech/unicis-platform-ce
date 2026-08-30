import React from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useTranslation } from 'next-i18next';
import { defaultHeaders, validatePassword } from '@/lib/common';

import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardHeader,
} from '@/components/shared';
import { Loader2 } from 'lucide-react';

const schema = Yup.object({
  currentPassword: Yup.string().required(),
  newPassword: Yup.string()
    .required()
    .test(
      'is-strong',
      'Password must include uppercase, lowercase, number, and special character',
      validatePassword
    ),
});

const UpdatePassword: React.FC = () => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: { currentPassword: '', newPassword: '' },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      const res = await fetch('/api/password', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        toast.success(t('successfully-updated'));
        resetForm();
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <ManagementCard>
        <ManagementCardHeader
          title={t('password')}
          description={t('change-password-text')}
        />

        <ManagementCardContent className="space-y-4 p-4">
          <div className="grid gap-1">
            <Label htmlFor="currentPassword">{t('current-password')}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder={t('current-password')}
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
            />
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {formik.errors.currentPassword}
                </p>
              )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="newPassword">{t('new-password')}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={t('new-password')}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-destructive text-sm">
                {formik.errors.newPassword}
              </p>
            )}
          </div>
        </ManagementCardContent>

        <ManagementCardFooter>
          <Button type="submit" disabled={!formik.dirty || !formik.isValid}>
            {formik.isSubmitting && <Loader2 className="animate-spin" />}
            {t('change-password')}
          </Button>
        </ManagementCardFooter>
      </ManagementCard>
    </form>
  );
};

export default UpdatePassword;
