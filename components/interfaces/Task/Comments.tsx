import React, { useState, useCallback } from 'react';
import { getAxiosError } from '@/lib/common';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { Task } from '@prisma/client';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { ApiResponse } from 'types';
import type { TaskExtended } from 'types';
import { IssuePanelContainer } from 'sharedStyles';
import Comment from './comments/Comment';
import CreateCommentForm from './comments/CreateCommentForm';
import { AccessControl } from '@/components/shared/AccessControl';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

interface FormData {
  text: string;
}

export default function Comments({
  task,
  mutateTask,
}: {
  task: TaskExtended;
  mutateTask: () => Promise<void>;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug, taskNumber } = router.query;
  const [commentToEdit, setCommentToEdit] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const onDeleteClick = useCallback((id: number) => {
    setCommentToDelete(id);
    setConfirmationDialogVisible(true);
  }, []);

  const handleCreateComment = useCallback(
    async (
      text: string,
      reset: (initialValues?: Partial<FormData> | undefined) => void
    ) => {
      try {
        const response = await axios.post<ApiResponse<Task>>(
          `/api/teams/${slug}/tasks/${taskNumber}/comments`,
          {
            text,
          }
        );

        const { error } = response.data;

        if (error) {
          toast.error(error.message);
          return;
        }
        reset({
          text: '',
        });
        mutateTask();
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
    },
    []
  );

  const handleUpdateComment = useCallback(async (text: string, id: number) => {
    try {
      const response = await axios.put<ApiResponse<unknown>>(
        `/api/teams/${slug}/tasks/${taskNumber}/comments`,
        {
          id,
          text,
        }
      );

      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      mutateTask();
      setCommentToEdit(null);
    } catch (error: any) {
      toast.error(getAxiosError(error));
    }
  }, []);

  const handleDeleteComment = useCallback(async (id: number | null) => {
    if (!id) return;

    try {
      const response = await axios.delete<ApiResponse<unknown>>(
        `/api/teams/${slug}/tasks/${taskNumber}/comments`,
        {
          data: {
            id,
          },
        }
      );
      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      mutateTask();
    } catch (error: any) {
      toast.error(getAxiosError(error));
    }
  }, []);

  return (
    <IssuePanelContainer>
      <div style={{ marginTop: '30px' }}>
        {task.comments
          .sort(
            (a, b) =>
              Date.parse(a.createdAt as any) - Date.parse(b.createdAt as any)
          )
          .map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              commentToEdit={commentToEdit}
              setCommentToEdit={setCommentToEdit}
              updateComment={handleUpdateComment}
              deleteComment={onDeleteClick}
            />
          ))}
      </div>
      <AccessControl resource="task" actions={['update']}>
        <CreateCommentForm handleCreate={handleCreateComment} />
      </AccessControl>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => handleDeleteComment(commentToDelete)}
        title={t('confirm-delete-comment')}
      >
        {t('delete-comment-warning')}
      </ConfirmationDialog>
    </IssuePanelContainer>
  );
}
