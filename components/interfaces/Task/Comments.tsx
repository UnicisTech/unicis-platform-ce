import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import type { TaskExtended } from 'types';
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
  // const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
        const res = await fetch(
          `/api/teams/${slug}/tasks/${taskNumber}/comments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || 'Request failed');
          return;
        }

        reset({ text: '' });
        mutateTask();
      } catch {
        toast.error('Unexpected error');
      }
    },
    [slug, taskNumber, mutateTask]
  );

  const handleUpdateComment = useCallback(
    async (text: string, id: number) => {
      try {
        const res = await fetch(
          `/api/teams/${slug}/tasks/${taskNumber}/comments`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, text }),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || 'Request failed');
          return;
        }

        mutateTask();
        setCommentToEdit(null);
      } catch {
        toast.error('Unexpected error');
      }
    },
    [slug, taskNumber, mutateTask]
  );

  const handleDeleteComment = useCallback(
    async (id: number | null) => {
      if (!id) return;

      try {
        const res = await fetch(
          `/api/teams/${slug}/tasks/${taskNumber}/comments`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || 'Request failed');
          return;
        }

        mutateTask();
      } catch {
        toast.error('Unexpected error');
      }
    },
    [slug, taskNumber, mutateTask]
  );

  return (
    <div className="p-5">
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
        <div className="mt-4">
          <CreateCommentForm handleCreate={handleCreateComment} />
        </div>
      </AccessControl>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => handleDeleteComment(commentToDelete)}
        title={t('confirm-delete-comment')}
      >
        {t('delete-comment-warning')}
      </ConfirmationDialog>
    </div>
  );
}
