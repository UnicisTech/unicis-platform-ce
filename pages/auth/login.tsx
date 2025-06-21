import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { ComponentStatus, NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/shadcn/ui/alert';
import { Separator } from '@/components/shadcn/ui/separator';
import { Loader2 } from 'lucide-react';
import { authProviderEnabled } from '@/lib/auth';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const recaptchaRef = useRef<any>(null);

  const { error, success, token } = router.query as {
    error?: string;
    success?: string;
    token?: string;
  };

  useEffect(() => {
    if (error) setMessage({ text: error, status: 'error' });
    else if (success) setMessage({ text: success, status: 'success' });
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().required().email(),
      password: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const resp = await signIn('credentials', {
        ...values,
        csrfToken,
        redirect: false,
        callbackUrl: redirectUrl,
        recaptchaToken,
      });
      formik.resetForm();
      recaptchaRef.current?.reset();
      if (!resp?.ok) {
        toast.error(t(resp?.error ?? 'error'));
      }
    },
  });

  if (status === 'loading') return null;
  if (status === 'authenticated') router.push(redirectUrl);

  const params = token ? `?token=${token}` : '';

  return (
    <>
      {message.text && message.status && (
        <Alert
          variant={message.status === 'error' ? 'destructive' : 'default'}
          className="mb-4"
        >
          <AlertTitle>
            {message.status === 'error' ? t('error') : t('success')}
          </AlertTitle>
          <AlertDescription>{t(message.text)}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border pt-6">
        <CardContent>
          {authProviders.credentials && (
            <form onSubmit={formik.handleSubmit}>
              <input type="hidden" name="csrfToken" value={csrfToken} />

              <div className="space-y-4">
                <div className="grid gap-1">
                  <Label htmlFor="email">{t('Email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('Email')}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className="pr-10 text-base"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-destructive text-sm">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 relative">
                  <Label htmlFor="password">{t('Password')}</Label>
                  <div className="relative w-full">
                    <Input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      placeholder={t('Password')}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      className="pr-10 text-base"
                    />
                    <TogglePasswordVisibility
                      isPasswordVisible={isPasswordVisible}
                      handlePasswordVisibility={() =>
                        setIsPasswordVisible((v) => !v)
                      }
                    />
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-destructive text-sm">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <GoogleReCAPTCHA
                  recaptchaRef={recaptchaRef}
                  onChange={setRecaptchaToken}
                  siteKey={recaptchaSiteKey}
                />
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full"
                >
                  {formik.isSubmitting && <Loader2 className="animate-spin" />}
                  {t('sign-in')}
                </Button>
                <AgreeMessage text="sign-in" />
              </div>
            </form>
          )}

          {(authProviders.email || authProviders.saml) && (
            <Separator className="my-6" />
          )}

          <div className="space-y-3">
            {authProviders.email && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/auth/magic-link${params}`}>
                  {t('sign-in-with-email')}
                </Link>
              </Button>
            )}
            {authProviders.saml && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sso">{t('continue-with-saml-sso')}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-3">
        {t('dont-have-an-account')}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-primary hover:text-primary-focus ml-1"
        >
          {t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = (page: ReactElement) => (
  <AuthLayout heading="Welcome" description="Log in to your account">
    {page}
  </AuthLayout>
);

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { locale } = ctx;
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(ctx),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
