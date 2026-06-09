import React from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useTranslation } from 'next-i18next';
import { defaultHeaders, validatePassword } from '@/lib/common';

import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
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
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            {t('password')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('change-password-text')}</p>
        </div>

        <div className="p-4 space-y-4">
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
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-end">
          <Button type="submit" disabled={!formik.dirty || !formik.isValid}>
            {formik.isSubmitting && <Loader2 className="animate-spin" />}
            {t('change-password')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UpdatePassword;
