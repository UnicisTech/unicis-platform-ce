'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useDeletePack } from '@/hooks/fleets/packs/useDeletePack';
import { usePacks } from '@/hooks/fleets/packs/usePacks';

const DeletePack = ({
  packId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  packId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const deletePack = useDeletePack();
  const { mutatePacks } = usePacks(fleetTeamId);

  const handleDelete = async () => {
    const toastId = toast.loading(t('deleting'));

    try {
      await deletePack(fleetTeamId, packId);
      mutatePacks();
      toast.success(t('deleted-successfully'), { id: toastId });
    } catch {
      toast.error(t('error-deleting-package'), { id: toastId });
      return false;
    }
  };

  return (
    <ConfirmationDialog
      visible={visible}
      onCancel={() => setVisible(false)}
      onConfirm={handleDelete}
      title={t('confirm-permanent-package-delete')}
      confirmation={{
        requiredText: 'DELETE',
        label: t('confirm'),
        placeholder: t('enter-confirmation-text'),
        description: t('fleet:fleet-delete-description'),
      }}
    >
      <div className="space-y-3">
        <div className="space-y-1 text-muted-foreground">
          <p>{t('fleet:fleet-delete-warning')}</p>
          <p>{t('fleet:fleet-delete-pack-description')}</p>
        </div>
        <dl className="rounded-md border bg-muted/30 px-3 py-2.5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t('package')}
          </dt>
          <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground">
            {packId}
          </dd>
        </dl>
      </div>
    </ConfirmationDialog>
  );
};

export default DeletePack;
