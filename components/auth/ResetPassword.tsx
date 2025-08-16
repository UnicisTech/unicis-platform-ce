import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

import { defaultHeaders, validatePassword } from '@/lib/common';
import type { ApiResponse } from 'types';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';

const ResetPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const { t } = useTranslation('common');
  const { token } = router.query as { token: string };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required()
        .test(
          'is-strong',
          'Password must include uppercase, lowercase, number, and special character',
          validatePassword
        ),
      confirmPassword: Yup.string().test(
        'passwords-match',
        'Passwords must match',
        (value, context) => value === context.parent.password
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ ...values, token }),
      });

      const json = (await response.json()) as ApiResponse;

      setSubmitting(false);

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      resetForm();
      toast.success(t('password-updated'));
      router.push('/auth/login');
    },
  });

  return (
    <Card className="border border-border pt-6">
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* New password */}
          <div className="grid gap-1">
            <Label htmlFor="password">{t('new-password')}</Label>
            <div className="relative w-full">
              <Input
                id="password"
                name="password"
                type={showNew ? 'text' : 'password'}
                placeholder={t('new-password')}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={
                  !!(formik.touched.password && formik.errors.password)
                }
                aria-describedby="password-error"
                className="pr-10 text-base"
              />
              <TogglePasswordVisibility
                isPasswordVisible={showNew}
                handlePasswordVisibility={() => setShowNew((v) => !v)}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p id="password-error" className="text-destructive text-sm">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="grid gap-1">
            <Label htmlFor="confirmPassword">{t('confirm-password')}</Label>
            <div className="relative w-full">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder={t('confirm-password')}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={
                  !!(
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  )
                }
                aria-describedby="confirmPassword-error"
                className="pr-10 text-base"
              />
              <TogglePasswordVisibility
                isPasswordVisible={showConfirm}
                handlePasswordVisibility={() => setShowConfirm((v) => !v)}
              />
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-destructive text-sm"
                >
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={
                submitting ||
                !formik.values.password ||
                !formik.values.confirmPassword
              }
              className="w-full"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('reset-password')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
