import React, { ReactNode, useState } from 'react';
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
import type { User } from '@/generated/client';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';
import toast from 'react-hot-toast';
import { useAccessFleetAccount } from '@/hooks/fleets';
import {
  fleetAccessTokenCookieName,
  fleetAccessTokenCookieOptions,
  legacyFleetAccessTokenCookieName,
} from '@/lib/fleet/cookies';
import { useFleetConnection } from '@/hooks/fleets/connect/useFleetConnection';

interface FleetConnectRequiredProps {
  user: Partial<User>;
  teamId?: string;
  enrollmentToken?: string;
  isTeamAdmin?: boolean;
  children: (authProps: {
    isAuthenticated: boolean;
    logout: () => void;
  }) => ReactNode;
}

const loginSchema = Yup.object({
  fleetPassword: Yup.string().required().min(passwordPolicies.fleetMinLength),
});

const changeSchema = Yup.object({
  newPassword: Yup.string().required().min(passwordPolicies.fleetMinLength),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')])
    .required(),
});

const bootstrapSchema = Yup.object({
  password: Yup.string().required().min(passwordPolicies.fleetMinLength),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')])
    .required(),
});

const FleetConnectRequired = ({
  user,
  teamId,
  enrollmentToken,
  isTeamAdmin = false,
  children,
}: FleetConnectRequiredProps) => {
  const { t } = useTranslation(['common', 'fleet']);
  const [visible, setVisible] = useState(false);
  const [enrollmentDialogDismissed, setEnrollmentDialogDismissed] =
    useState(false);
  const [authOverride, setAuthOverride] = useState<boolean | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(
    user.email || ''
  );
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const { access, isLoading } = useVerifyFleetAsses();
  const {
    connection,
    isDisconnected,
    isDeleted,
    isLoading: isConnectionLoading,
    mutateFleetConnection,
  } = useFleetConnection(teamId);
  const accessFleetAccount = useAccessFleetAccount();
  const hasFleetToken = Boolean(
    Cookies.get(fleetAccessTokenCookieName) ||
      Cookies.get(legacyFleetAccessTokenCookieName)
  );
  const accessAuthenticated = Boolean(access?.is_active && !access.is_expired);
  const isAuthenticated =
    !isDeleted && (authOverride ?? (accessAuthenticated || hasFleetToken));
  const shouldOpenEnrollmentDialog = Boolean(
    enrollmentToken && !isAuthenticated && !enrollmentDialogDismissed
  );
  const connectDialogOpen = visible || shouldOpenEnrollmentDialog;

  const handleConnectDialogOpenChange = (open: boolean) => {
    setVisible(open);

    if (!open && shouldOpenEnrollmentDialog) {
      setEnrollmentDialogDismissed(true);
    }

    if (open) {
      setEnrollmentDialogDismissed(false);
    }
  };

  const loginFormik = useFormik({
    initialValues: { fleetPassword: '' },
    validationSchema: loginSchema,
    onSubmit: async ({ fleetPassword }) => {
      if (!user.email) return;

      try {
        const login = await accessFleetAccount(user.email, fleetPassword);

        if (login?.is_temporary_password) {
          setTempPassword(fleetPassword);

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

        if (enrollmentToken) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: enrollmentToken,
              fleetPassword,
            }),
          }).catch((err) => {
            console.error(
              '[FleetConnect] Failed to complete enrollment by token:',
              err
            );
          });
        }

        if (teamId && user.email) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              teamId: teamId,
              fleetPassword,
            }),
          }).catch((err) => {
            console.error(
              '[FleetConnect] Failed to complete enrollment by email:',
              err
            );
          });
        }

        Cookies.set(
          fleetAccessTokenCookieName,
          login.fleet_access.secret_key,
          fleetAccessTokenCookieOptions
        );

        if (teamId) {
          await fetch('/api/fleet/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to sync member:', err);
          });

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
        setAuthOverride(true);
      } catch {
        toast.error(t('fleet:fleet-login-failed'));
      }
    },
  });

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
          throw new Error(
            error.error || t('fleet:fleet-password-update-failed')
          );
        }

        console.log(
          '[FleetConnect] Password changed successfully, logging in with new password...'
        );
        const login = await accessFleetAccount(user.email!, newPassword);
        console.log('[FleetConnect] Login successful after password change');

        if (enrollmentToken) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: enrollmentToken,
              fleetPassword: newPassword,
            }),
          }).catch((err) => {
            console.error(
              '[FleetConnect] Failed to complete enrollment by token after password change:',
              err
            );
          });
        }

        if (teamId && user.email) {
          await fetch('/api/fleet/enroll/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              teamId: teamId,
              fleetPassword: newPassword,
            }),
          }).catch((err) => {
            console.error(
              '[FleetConnect] Failed to complete enrollment by email after password change:',
              err
            );
          });
        }

        Cookies.set(
          fleetAccessTokenCookieName,
          login.fleet_access.secret_key,
          fleetAccessTokenCookieOptions
        );

        if (teamId) {
          await fetch('/api/fleet/sync-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
          }).catch((err) => {
            console.error('[FleetConnect] Failed to sync member:', err);
          });

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
        setAuthOverride(true);
      } catch (error) {
        console.error('[FleetConnect] Error in password change flow:', error);
        toast.error(t('fleet:fleet-password-update-failed'));
      }
    },
  });

  const bootstrapFormik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: bootstrapSchema,
    onSubmit: async ({ password }) => {
      if (!teamId) {
        toast.error(t('fleet:team-id-required'));
        return;
      }

      setIsBootstrapping(true);
      try {
        const response = await fetch('/api/fleet/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId,
            password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || t('fleet:fleet-bootstrap-failed'));
        }

        const data = await response.json();

        Cookies.set(
          fleetAccessTokenCookieName,
          data.fleetToken,
          fleetAccessTokenCookieOptions
        );

        toast.success(t('fleet:fleet-account-created'));
        setShowBootstrap(false);
        setAuthOverride(true);
        await mutateFleetConnection();
      } catch (error) {
        console.error('[Bootstrap] Error:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : t('fleet:fleet-bootstrap-failed')
        );
      } finally {
        setIsBootstrapping(false);
      }
    },
  });

  const logout = () => {
    Cookies.remove(fleetAccessTokenCookieName);
    Cookies.remove(legacyFleetAccessTokenCookieName);
    setAuthOverride(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error(t('fleet:email-required'));
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

      toast.success(t('fleet:password-reset-link-sent'));
      setShowForgotPassword(false);
      setVisible(false);
    } catch (error) {
      console.log(error);
      toast.error(t('fleet:fleet-forgot-password-failed'));
    } finally {
      setSendingResetEmail(false);
    }
  };

  if (isLoading || isConnectionLoading) return <Loading />;

  if (isDisconnected) {
    return (
      <>
        <div className="rounded border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-2xl font-bold">
            {t('fleet:fleet-disconnected')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            {t('fleet:fleet-disconnected-retention', {
              date: connection?.deleteAfter
                ? new Date(connection.deleteAfter).toLocaleDateString()
                : '-',
            })}
          </p>
          {isTeamAdmin && (
            <Button
              className="mt-6"
              size="sm"
              onClick={() => setShowBootstrap(true)}
            >
              {t('fleet:fleet-connect')}
            </Button>
          )}
        </div>

        <Dialog open={showBootstrap} onOpenChange={setShowBootstrap}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={bootstrapFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t('fleet:create-fleet-account')}</DialogTitle>
                <DialogDescription>
                  {t('fleet:bootstrap-description')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t('password')}</Label>
                  <Input
                    type="password"
                    name="password"
                    value={bootstrapFormik.values.password}
                    onChange={bootstrapFormik.handleChange}
                    placeholder={t('fleet:enter-password')}
                  />
                  {bootstrapFormik.errors.password &&
                    bootstrapFormik.touched.password && (
                      <p className="text-sm text-destructive">
                        {bootstrapFormik.errors.password}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>{t('confirm-password')}</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={bootstrapFormik.values.confirmPassword}
                    onChange={bootstrapFormik.handleChange}
                    placeholder={t('confirm-password')}
                  />
                  {bootstrapFormik.errors.confirmPassword &&
                    bootstrapFormik.touched.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {bootstrapFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBootstrap(false)}
                  disabled={isBootstrapping}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isBootstrapping}>
                  {isBootstrapping ? t('creating') : t('fleet:create-account')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (isAuthenticated) return <>{children({ isAuthenticated, logout })}</>;

  return (
    <>
      <div className="hero rounded ring-1 ring-gray-300">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">
              {t('fleet:fleet-connection-required')}
            </h1>
            <p className="py-6">
              {isTeamAdmin
                ? t('fleet:fleet-bootstrap-prompt')
                : t('fleet:fleet-connection-prompt')}
            </p>
            <div className="flex gap-2 justify-center">
              {isTeamAdmin && (
                <Button size="sm" onClick={() => setShowBootstrap(true)}>
                  {t('fleet:fleet-order-secret')}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVisible(true)}
              >
                {t('fleet:fleet-connect')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={connectDialogOpen}
        onOpenChange={handleConnectDialogOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          {showForgotPassword ? (
            <div>
              <DialogHeader>
                <DialogTitle>{t('fleet:fleet-forgot-password')}</DialogTitle>
                <DialogDescription>
                  {t('fleet:fleet-forgot-password-description')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <Label>{t('email')}</Label>
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
                  {sendingResetEmail
                    ? t('fleet:fleet-sending')
                    : t('fleet:send-reset-link')}
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
                <Button type="submit">{t('fleet:fleet-connect')}</Button>
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
                <Button type="submit">{t('fleet:update-password')}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBootstrap} onOpenChange={setShowBootstrap}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={bootstrapFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('fleet:create-fleet-account')}</DialogTitle>
              <DialogDescription>
                {t('fleet:bootstrap-description')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>{t('password')}</Label>
                <Input
                  type="password"
                  name="password"
                  value={bootstrapFormik.values.password}
                  onChange={bootstrapFormik.handleChange}
                  placeholder={t('fleet:enter-password')}
                />
                {bootstrapFormik.errors.password &&
                  bootstrapFormik.touched.password && (
                    <p className="text-sm text-destructive">
                      {bootstrapFormik.errors.password}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label>{t('confirm-password')}</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={bootstrapFormik.values.confirmPassword}
                  onChange={bootstrapFormik.handleChange}
                  placeholder={t('confirm-password')}
                />
                {bootstrapFormik.errors.confirmPassword &&
                  bootstrapFormik.touched.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {bootstrapFormik.errors.confirmPassword}
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBootstrap(false)}
                disabled={isBootstrapping}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isBootstrapping}>
                {isBootstrapping ? t('creating') : t('fleet:create-account')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetConnectRequired;
