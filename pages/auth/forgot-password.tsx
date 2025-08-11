import { AuthLayout } from '@/components/layouts';
import { defaultHeaders } from '@/lib/common';
import { useFormik } from 'formik';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, type ReactElement, useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import * as Yup from 'yup';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import env from '@/lib/env';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

const ForgotPassword: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ recaptchaSiteKey }) => {
  const { t } = useTranslation('common');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          recaptchaToken,
        }),
      });

      const json = (await response.json()) as ApiResponse;

      resetForm();
      recaptchaRef.current?.reset();

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('password-reset-link-sent'));
    },
  });

  return (
    <>
      <Head>
        <title>{t('forgot-password-title')}</title>
      </Head>

      <Card className="border border-border pt-6">
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="email">{t('Email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('Email')}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.email && formik.errors.email)}
                aria-describedby="email-error"
                className="text-base"
              />
              {formik.touched.email && formik.errors.email && (
                <p id="email-error" className="text-destructive text-sm">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <GoogleReCAPTCHA
              recaptchaRef={recaptchaRef}
              onChange={setRecaptchaToken}
              siteKey={recaptchaSiteKey}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={formik.isSubmitting || !formik.values.email}
                className="w-full"
              >
                {formik.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('email-password-reset-link')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-3">
        {t('already-have-an-account')}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-primary-focus ml-1"
        >
          {t('sign-in')}
        </Link>
      </p>
    </>
  );
};

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="Reset Password">{page}</AuthLayout>;
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default ForgotPassword;
