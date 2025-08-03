import React, { useCallback, useState, MouseEvent } from 'react';
import axios from 'axios';
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

  const downloadHanlder = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const response = await axios.get(
          `/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`,
          {
            responseType: 'blob',
          }
        );

        const { error } = response.data;
        if (error) {
          toast.error(error.message);
          return;
        }

        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        });
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
    [attachment.id, taskNumber, teamSlug]
  );

  const deleteHandler = useCallback(async () => {
    // event.preventDefault();
    // event.stopPropagation();

    const response = await axios.delete(
      `/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`
    );
    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Attachment deleted');
    mutateTask();
  }, []);

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
          <Button size={'sm'} className="mr-1" onClick={downloadHanlder}>
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
