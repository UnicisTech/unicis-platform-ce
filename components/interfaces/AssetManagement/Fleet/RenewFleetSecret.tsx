import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { useRenewFleetSecret } from '@/hooks/fleets';
import { useGetFleetSecret } from '@/hooks/fleets/connect/useGetFleetSecret';

const RenewFleetSecret = ({
  visible,
  setVisible,
  teamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  teamId: string;
}) => {
  const { t } = useTranslation('common');
  const renewFleetSecret = useRenewFleetSecret();
  const { mutateFleetSecret } = useGetFleetSecret(teamId);

  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      toast.error(t('please-confirm-before-renewing'));
      return;
    }

    try {
      setIsSubmitting(true);
      await renewFleetSecret(teamId);
      mutateFleetSecret();
      setVisible(false);
      toast.success(t('fleet-secret-renewed'));
    } catch {
      toast.error(t('error-renewing-fleet-secret'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent>
        <form onSubmit={handleRenew}>
          <DialogHeader>
            <DialogTitle>{t('confirm-fleet-secret-renew')}</DialogTitle>
            <DialogDescription>
              {t('fleet-renew-node-description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="confirm_fleet_secret_renew"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(!!checked)}
            />
            <label
              htmlFor="confirm_fleet_secret_renew"
              className="text-sm cursor-pointer"
            >
              {t('confirm-renew-checkbox')}
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!confirmed || isSubmitting}>
              {isSubmitting ? t('renewing') : t('renew')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t('close')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenewFleetSecret;
