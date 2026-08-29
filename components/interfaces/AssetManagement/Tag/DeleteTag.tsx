'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useDeleteTag } from '@/hooks/fleets/Tags/useDeleteTag';
import { useTags } from '@/hooks/fleets/Tags/useTags';

const DeleteTag = ({
  tagId,
  visible,
  setVisible,
  fleetTeamId,
}: {
  tagId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const deleteTag = useDeleteTag();
  const { mutateTags } = useTags(fleetTeamId);

  const handleDelete = async () => {
    const toastId = toast.loading(t('deleting'));

    try {
      await deleteTag(fleetTeamId, tagId);
      mutateTags();
      toast.success(t('deleted-successfully'), { id: toastId });
    } catch {
      toast.error(t('error-deleting-tag'), { id: toastId });
      return false;
    }
  };

  return (
    <ConfirmationDialog
      visible={visible}
      onCancel={() => setVisible(false)}
      onConfirm={handleDelete}
      title={t('confirm-permanent-tag-delete')}
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
            {t('tag')}
          </dt>
          <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground">
            {tagId}
          </dd>
        </dl>
      </div>
    </ConfirmationDialog>
  );
};

export default DeleteTag;
