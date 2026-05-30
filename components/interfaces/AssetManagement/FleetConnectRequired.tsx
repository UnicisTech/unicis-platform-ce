import React, { ReactNode, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Loading } from '@/components/shared';
import { passwordPolicies } from '@/lib/common';
import { useTranslation } from 'next-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Cookies from 'js-cookie';
import { User } from '@/generated/client';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';
import toast from 'react-hot-toast';
import { useAccessFleetAccount } from '@/hooks/fleets';
import Link from 'next/link';

interface FleetConnectRequiredProps {
  user: Partial<User>;
  teamId?: string;
  enrollmentToken?: string;
  children: (authProps: {
    isAuthenticated: boolean;
    logout: () => void;
  }) => ReactNode;
}

const FLEET_COOKIE =
  'ufs-J69MRTGVH$-RD6FTTMERCJ2R4VK5ECLLQOM5CC5C26C-TSA';

const loginSchema = Yup.object({
  fleetPassword: Yup.string()
    .required()
    .min(passwordPolicies.fleetMinLength),
});

const changeSchema = Yup.object({
  newPassword: Yup.string()
    .required()
    .min(passwordPolicies.fleetMinLength),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required(),
});

const FleetConnectRequired = ({
  user,
  teamId,
  enrollmentToken,
  children,
}: FleetConnectRequiredProps) => {
  const { t } = useTranslation(['common', 'fleet']);
  const [visible, setVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(user.email || '');
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const { access, isLoading } = useVerifyFleetAsses();
  const accessFleetAccount = useAccessFleetAccount();

  // ---------------- LOGIN ----------------

  const loginFormik = useFormik({
    initialValues: { fleetPassword: '' },
    validationSchema: loginSchema,
    onSubmit: async ({ fleetPassword }) => {
      if (!user.email) return;

      try {
        const login = await accessFleetAccount(user.email, fleetPassword);

        if (login?.is_temporary_password) {
          setTempPassword(fleetPassword);

          // завершити enrollment одразу якщо є токен
          if (enrollmentToken) {
            await fetch('/api/fleet/enroll/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: enrollmentToken,
                fleetPassword,
              }),
            });
          }

          setMustChangePassword(true);
          return;
        }

        // якщо пароль вже постійний - завжди завершити enrollment
        if (enrollmentToken) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: enrollmentToken,
              fleetPassword,
            }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to complete enrollment by token:', err);
          });
        }

        if (teamId && user.email) {
          // Завжди перевіряти і завершити enrollment якщо він є
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              teamId: teamId,
              fleetPassword,
            }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to complete enrollment by email:', err);
          });
        }

        Cookies.set(FLEET_COOKIE, login.fleet_access.secret_key, {
          sameSite: 'strict',
        });

        // Sync member to Fleet team (in case team was created after enrollment)
        if (teamId) {
          await fetch('/api/fleet/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to sync member:', err);
          });

          // Ensure Fleet secret exists
          await fetch('/api/fleet/ensure-secret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to ensure secret:', err);
          });
        }

        toast.success(t('fleet:fleet-connected'));
        setVisible(false);
        setIsAuthenticated(true);
      } catch {
        toast.error(t('fleet:fleet-login-failed'));
      }
    },
  });

  // ---------------- CHANGE PASSWORD ----------------

  const changeFormik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: changeSchema,
    onSubmit: async ({ newPassword }) => {
      try {
        console.log('[FleetConnect] Changing password for:', user.email);
        const changeRes = await fetch('/api/fleet/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            oldPassword: tempPassword,
            newPassword,
          }),
        });

        if (!changeRes.ok) {
          const error = await changeRes.json();
          console.error('[FleetConnect] Password change failed:', error);
          throw new Error(error.error || 'Password change failed');
        }

        console.log('[FleetConnect] Password changed successfully, logging in with new password...');
        // після зміни знов логінимося
        const login = await accessFleetAccount(user.email!, newPassword);
        console.log('[FleetConnect] Login successful after password change');

        // обовʼязково завершити enrollment
        if (enrollmentToken) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: enrollmentToken,
              fleetPassword: newPassword,
            }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to complete enrollment by token after password change:', err);
          });
        }

        if (teamId && user.email) {
          // Завжди перевіряти і завершити enrollment якщо він є
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              teamId: teamId,
              fleetPassword: newPassword,
            }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to complete enrollment by email after password change:', err);
          });
        }

        Cookies.set(FLEET_COOKIE, login.fleet_access.secret_key, {
          sameSite: 'strict',
        });

        // Sync member to Fleet team (in case team was created after enrollment)
        if (teamId) {
          await fetch('/api/fleet/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to sync member:', err);
          });

          // Ensure Fleet secret exists
          await fetch('/api/fleet/ensure-secret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to ensure secret:', err);
          });
        }

        toast.success(t('fleet:fleet-password-updated'));
        setMustChangePassword(false);
        setVisible(false);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('[FleetConnect] Error in password change flow:', error);
        toast.error(t('fleet:fleet-password-update-failed'));
      }
    },
  });

  // ---------------- EFFECTS ----------------

  useEffect(() => {
    if (access?.is_active && !access.is_expired) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [access]);

  useEffect(() => {
    if (enrollmentToken && !isAuthenticated) {
      setVisible(true);
    }
  }, [enrollmentToken, isAuthenticated]);

  const logout = () => {
    Cookies.remove(FLEET_COOKIE);
    setIsAuthenticated(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error(t('email-required'));
      return;
    }

    setSendingResetEmail(true);

    try {
      const response = await fetch('/api/fleet/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t('fleet:fleet-forgot-password-failed'));
        return;
      }

      toast.success(t('password-reset-link-sent'));
      setShowForgotPassword(false);
      setVisible(false);
    } catch (error) {
      toast.error(t('fleet:fleet-forgot-password-failed'));
    } finally {
      setSendingResetEmail(false);
    }
  };

  if (isLoading) return <Loading />;
  if (isAuthenticated) return <>{children({ isAuthenticated, logout })}</>;

  return (
    <>
      <div className="hero rounded ring-1 ring-gray-300">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">
              {t('fleet:fleet-connection-required')}
            </h1>
            <p className="py-6">{t('fleet:fleet-connection-prompt')}</p>
            <Button size="sm" onClick={() => setVisible(true)}>
              {t('fleet:fleet-connect')}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="sm:max-w-md">
          {showForgotPassword ? (
            <div>
              <DialogHeader>
                <DialogTitle>{t('fleet:fleet-forgot-password')}</DialogTitle>
                <DialogDescription>
                  Enter your email to receive a password reset link
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <Label>{t('Email')}</Label>
                <Input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>

              <DialogFooter className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={sendingResetEmail}
                >
                  {sendingResetEmail ? t('sending') : t('send-reset-link')}
                </Button>
              </DialogFooter>
            </div>
          ) : !mustChangePassword ? (
            <form onSubmit={loginFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t('fleet:fleet-connect-title')}</DialogTitle>
                <DialogDescription>
                  {t('fleet:fleet-password-description')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <Label>{t('fleet:fleet-user-password')}</Label>
                <Input
                  type="password"
                  name="fleetPassword"
                  value={loginFormik.values.fleetPassword}
                  onChange={loginFormik.handleChange}
                />
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  {t('fleet:fleet-forgot-password')}
                </button>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit">
                  {t('fleet:fleet-connect')}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={changeFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t('fleet:fleet-change-password')}</DialogTitle>
                <DialogDescription>
                  {t('fleet:fleet-must-change-password')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <Label>{t('new-password')}</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={changeFormik.values.newPassword}
                  onChange={changeFormik.handleChange}
                />

                <Label>{t('confirm-password')}</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={changeFormik.values.confirmPassword}
                  onChange={changeFormik.handleChange}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit">
                  {t('update-password')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetConnectRequired;
