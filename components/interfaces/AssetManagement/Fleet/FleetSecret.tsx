import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  CopyToClipboardButton,
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardHeader,
} from '@/components/shared';
import type { Team, User } from '@/generated/client';
import FleetStatus from './FleetStatus';
import RenewFleetSecret from './RenewFleetSecret';
import { useBootstrapFleet } from '@/hooks/fleets';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';
import { useDeleteFleetSecret } from '@/hooks/fleets/connect/useDeleteFleetSecret';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { passwordPolicies } from '@/lib/common';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  fleetAccessTokenCookieName,
  fleetAccessTokenCookieOptions,
} from '@/lib/fleet/cookies';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';

const passwordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(
      passwordPolicies.fleetMinLength,
      `Password must be at least ${passwordPolicies.fleetMinLength} characters`
    ),
});

const FleetSecret = ({ team, user }: { user: Partial<User>; team: Team }) => {
  const { t } = useTranslation(['common', 'fleet']);
  const teamId = team.id;
  const [safe, setSafe] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);

  const bootstrapFleet = useBootstrapFleet();
  const deleteFleetSecret = useDeleteFleetSecret();
  const [renewVisible, setRenewVisible] = useState(false);

  const { secret, isLoading, mutateFleetSecret } = useGetFleetSecret(team.id);
  const { mutateFleetAccess } = useVerifyFleetAsses();
  const hasSecret = Boolean(secret?.secret);

  const formik = useFormik({
    initialValues: { password: '' },
    validationSchema: passwordSchema,
    onSubmit: async ({ password }) => {
      try {
        console.log('[FleetSecret] Bootstrapping Fleet...');
        const response = await bootstrapFleet(teamId, password);

        console.log('[FleetSecret] Bootstrap successful:', response);

        // Store Fleet token in cookie for future requests
        Cookies.set(
          fleetAccessTokenCookieName,
          response.fleetToken,
          fleetAccessTokenCookieOptions
        );

        await Promise.all([mutateFleetSecret(), mutateFleetAccess()]);
        setPasswordDialogVisible(false);
        formik.resetForm();
        toast.success(t('fleet:fleet-enrollment-secret-ordered'));
      } catch (error: any) {
        console.error('[FleetSecret] Error:', error);
        toast.error(error?.message || t('fleet:error-ordering-fleet-secret'));
      }
    },
  });

  const handleOrderSecret = () => {
    setPasswordDialogVisible(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteFleetSecret(teamId);
      await mutateFleetSecret(null);
      setDeleteConfirmVisible(false);
      toast.success(t('successfully-deleted'));
    } catch (error: any) {
      toast.error(error?.message || t('fleet:error-deleting-fleet-secret'));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSafe = () => setSafe(!safe);

  return (
    <ManagementCard>
      <ManagementCardHeader
        title={t('fleet:fleet-secret')}
        description={t('fleet:fleet-secret-description')}
      />

      <ManagementCardContent className="p-4">
        {!user ? (
          <FleetStatus status="access-not-granted" />
        ) : (
          <>
            {hasSecret && (
              <div className="relative [&>button]:h-7 [&>button]:w-7">
                <Input
                  aria-label={t('fleet:fleet-secret')}
                  className="pr-20 font-mono"
                  type={safe ? 'password' : 'text'}
                  value={secret?.secret ?? ''}
                  readOnly
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleSafe}
                  aria-label={t('fleet:fleet-safe-sensitives')}
                  aria-pressed={!safe}
                  title={t('fleet:fleet-safe-sensitives')}
                  className="absolute right-9 top-[5px] h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  {safe ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </Button>
                <CopyToClipboardButton value={secret?.secret ?? ''} />
              </div>
            )}
            {!hasSecret && (
              <div className="rounded-md border border-dashed bg-muted/20 px-5 py-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t('fleet:fleet-secret-not-found')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('fleet:fleet-secret-not-found-warning')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </ManagementCardContent>

      <ManagementCardFooter className="sm:justify-between">
        {!hasSecret ? (
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleOrderSecret}
            className="sm:ml-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('fleet:fleet-order-secret')}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={isLoading || isDeleting || !secret?.secret}
              onClick={() => setDeleteConfirmVisible(true)}
              variant="destructive"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('fleet:fleet-secret-reset')}
            </Button>

            <Button
              type="button"
              disabled={isLoading || isDeleting || !secret?.secret}
              onClick={() => setRenewVisible(true)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('fleet:fleet-renew-secret')}
            </Button>
          </>
        )}
      </ManagementCardFooter>

      <RenewFleetSecret
        teamId={teamId}
        setVisible={setRenewVisible}
        visible={renewVisible}
      />

      <ConfirmationDialog
        visible={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={handleDelete}
        title={t('fleet:fleet-secret-reset')}
        confirmText={t('delete')}
      >
        <p>{t('delete-warning')}</p>
        <p>{t('fleet:fleet-delete-warning')}</p>
      </ConfirmationDialog>

      <Dialog
        open={passwordDialogVisible}
        onOpenChange={setPasswordDialogVisible}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={formik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('fleet:fleet-enter-password')}</DialogTitle>
              <DialogDescription>
                {t('fleet:fleet-password-description')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('fleet:fleet-user-password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="current-password"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogVisible(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('continue')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ManagementCard>
  );
};

export default FleetSecret;
