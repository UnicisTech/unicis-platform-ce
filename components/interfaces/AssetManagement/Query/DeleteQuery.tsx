import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useDeleteQuery } from '@/hooks/fleets/queries/useDeleteQuery';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useQueries } from '@/hooks/fleets/queries/useQueries';

const DeleteQuery = ({
  queryId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  queryId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);

  const deleteQuery = useDeleteQuery();
  const { mutateQueries } = useQueries(fleetTeamId);

  const handleDelete = async () => {
    const toastId = toast.loading(t('deleting-query'));

    try {
      await deleteQuery(fleetTeamId, queryId);
      mutateQueries();
      toast.success(t('deleted-successfully'), { id: toastId });
    } catch {
      toast.error(t('error'), { id: toastId });
      return false;
    }
  };

  return (
    <ConfirmationDialog
      visible={visible}
      onCancel={() => setVisible(false)}
      onConfirm={handleDelete}
      title={t('confirm-permanent-query-delete')}
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
            {t('query')}
          </dt>
          <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground">
            {queryId}
          </dd>
        </dl>
      </div>
    </ConfirmationDialog>
  );
};

export default DeleteQuery;
