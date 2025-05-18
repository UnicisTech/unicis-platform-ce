import React, { useCallback, MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import type { Attachment } from 'types';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import DaisyModal from '@/components/shared/daisyUI/DaisyModal';

const DeleteAttachment = ({
  visible,
  setVisible,
  taskNumber,
  teamSlug,
  attachment,
  mutateTask,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  taskNumber: string;
  teamSlug: string;
  attachment: Attachment;
  mutateTask: () => Promise<void>;
}) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);

  const deleteHandler = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      setIsLoading(true);

      const response = await axios.delete(
        `/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`
      );
      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setVisible(false);
      toast.success('Attachment deleted');
      mutateTask();
    },
    []
  );

  return (
    <DaisyModal open={visible}>
      <DaisyModal.Header className="font-bold">
        {t('attachment-delete')}
      </DaisyModal.Header>
      <DaisyModal.Body>
        <div className="mt-2 flex flex-col space-y-4">
          <p>Attachment will be deleted.</p>
        </div>
      </DaisyModal.Body>
      <DaisyModal.Actions>
        <DaisyButton color="error" onClick={deleteHandler} loading={isLoading}>
          {t('delete')}
        </DaisyButton>
        <DaisyButton
          type="button"
          variant="outline"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t('close')}
        </DaisyButton>
      </DaisyModal.Actions>
    </DaisyModal>
  );
};

export default DeleteAttachment;
