import React, { useCallback, useState, MouseEvent } from 'react';
import toast from 'react-hot-toast';
import type { Attachment } from 'types';
import useCanAccess from 'hooks/useCanAccess';
import useTheme from 'hooks/useTheme';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shadcn/ui/button';

const AttachmentsCard = ({
  attachment,
  taskNumber,
  teamSlug,
  mutateTask,
}: {
  attachment: Attachment;
  taskNumber: string;
  teamSlug: string;
  mutateTask: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const { canAccess } = useCanAccess();

  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const downloadHandler = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const res = await fetch(
          `/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`
        );

        if (!res.ok) {
          toast.error('Failed to download file');
          return;
        }

        // Optional: check for JSON error response before treating as a blob
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const { error } = await res.json();
          toast.error(error?.message || 'Request failed');
          return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.filename;
        link.click();

        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast.error('Failed to download file');
        console.error(error);
      }
    },
    [attachment.id, attachment.filename, taskNumber, teamSlug]
  );


  const deleteHandler = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`,
        { method: 'DELETE' }
      );

      const { error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || 'Request failed');
        return;
      }

      toast.success('Attachment deleted');
      mutateTask();
    } catch {
      toast.error('Unexpected error');
    }
  }, [teamSlug, taskNumber, attachment.id, mutateTask]);

  const openDeleteModal = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDeleteVisible(true);
    },
    []
  );

  const cardBg = isDark ? 'bg-gray-700' : 'bg-white';
  const borderColor = isDark ? 'border-gray-500' : 'border-gray-200';
  const textColor = isDark ? 'text-white' : 'text-black';

  return (
    <>
      <div
        className={`rounded-md shadow-md w-40 m-1 border ${borderColor} ${cardBg} ${textColor}`}
      >
        <div className="flex justify-between px-1 py-1">
          <Button size={'sm'} className="mr-1" onClick={downloadHandler}>
            Download
          </Button>
          {canAccess('task', ['update']) && (
            <Button
              variant={'destructive'}
              size={'sm'}
              onClick={openDeleteModal}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="px-2 py-1 border-t border-gray-300 dark:border-gray-600">
          <p className="text-sm truncate">{attachment.filename}</p>
        </div>
      </div>

      <ConfirmationDialog
        title={t('attachment-delete')}
        visible={isDeleteVisible}
        onConfirm={() => deleteHandler()}
        onCancel={() => setIsDeleteVisible(false)}
        cancelText={t('cancel')}
      >
        {t('delete-attachment-confirm')}
      </ConfirmationDialog>
    </>
  );
};

export default AttachmentsCard;
