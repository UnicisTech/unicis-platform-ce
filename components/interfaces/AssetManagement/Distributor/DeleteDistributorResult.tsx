'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useDeleteDistributed } from '@/hooks/fleets/distributors/useDeleteDistributor';
import { useDistributors } from '@/hooks/fleets/distributors/useDistributors';

const DeleteDistributors = ({
  distributorId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  distributorId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const deleteDistributor = useDeleteDistributed();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const handleDelete = async () => {
    const toastId = toast.loading(t('deleting'));

    try {
      await deleteDistributor(fleetTeamId, distributorId);
      mutateDistributorsTasks();
      toast.success(t('deleted-successfully'), { id: toastId });
    } catch {
      toast.error(t('error-deleting-script'), { id: toastId });
      return false;
    }
  };

  return (
    <ConfirmationDialog
      visible={visible}
      onCancel={() => setVisible(false)}
      onConfirm={handleDelete}
      title={t('confirm-permanent-script-delete')}
      confirmation={{
        requiredText: 'DELETE',
        label: t('confirm'),
        placeholder: t('enter-confirmation-text'),
        description: t('fleet:fleet-delete-description'),
      }}
    >
      <div className="space-y-3">
        <p className="text-muted-foreground">
          {t('fleet:fleet-delete-warning')}
        </p>
        <dl className="rounded-md border bg-muted/30 px-3 py-2.5">
          <dt className="text-xs font-medium text-muted-foreground">
            {t('script')}
          </dt>
          <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground">
            {distributorId}
          </dd>
        </dl>
      </div>
    </ConfirmationDialog>
  );
};

export default DeleteDistributors;
