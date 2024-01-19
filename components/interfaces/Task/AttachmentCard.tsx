import React, { useCallback, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Attachment } from 'types';
import { MouseEvent } from 'react';
import DeleteAttachment from './DeleteAttachment';
import useCanAccess from 'hooks/useCanAccess';

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
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const { canAccess } = useCanAccess();

  const downloadHanlder = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      try {
        event.preventDefault();
        event.stopPropagation();

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
        // Handle error here
      }
    },
    []
  );

  const openDeleteModal = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDeleteVisible(true);
    },
    []
  );

  return (
    <>
      <div className="card card-compact w-36 bg-base-100 shadow-xl p-0.5 m-1 dark:bg-gray-500 dark:text-white">
        <div className="flex">
          <button
            className="btn btn-info btn-xs m-0.5"
            onClick={downloadHanlder}
          >
            Download
          </button>
          {canAccess('task', ['update']) && (
            <button
              className="btn btn-error btn-xs m-0.5"
              onClick={openDeleteModal}
            >
              Delete
            </button>
          )}
        </div>
        <div className="card-body">
          <p className="text-sm truncate">{attachment.filename}</p>
        </div>
      </div>
      <DeleteAttachment
        visible={isDeleteVisible}
        setVisible={setIsDeleteVisible}
        taskNumber={taskNumber}
        teamSlug={teamSlug}
        attachment={attachment}
        mutateTask={mutateTask}
      />
    </>
  );
};

export default AttachmentsCard;
