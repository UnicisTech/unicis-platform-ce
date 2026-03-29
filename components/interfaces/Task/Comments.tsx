import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import type { TaskExtendedDto } from 'types';
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
  task: TaskExtendedDto;
  mutateTask: () => Promise<void>;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug: slugQuery, taskNumber } = router.query;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery;
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
      reset: (
        initialValues?: Partial<FormData> | undefined,
        options?: {
          keepErrors?: boolean;
          keepTouched?: boolean;
          keepDirty?: boolean;
          keepIsSubmitted?: boolean;
          keepSubmitCount?: boolean;
        }
      ) => void
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
          toast.error(error?.message || t('errors.requestFailed'));
          return;
        }

        reset(
          { text: '' },
          {
            keepErrors: false,
            keepTouched: false,
            keepDirty: false,
            keepIsSubmitted: false,
            keepSubmitCount: false,
          }
        );
        mutateTask();
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateTask, t]
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
          toast.error(error?.message || t('errors.requestFailed'));
          return;
        }

        mutateTask();
        setCommentToEdit(null);
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateTask, t]
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
          toast.error(error?.message || t('errors.requestFailed'));
          return;
        }

        mutateTask();
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateTask, t]
  );

  return (
    <div className="p-5">
      <div className="mt-[30px]">
        {task.comments
          .sort(
            (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
          )
          .map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              slug={slug}
              commentToEdit={commentToEdit}
              setCommentToEdit={setCommentToEdit}
              updateComment={handleUpdateComment}
              deleteComment={onDeleteClick}
            />
          ))}
      </div>
      <AccessControl resource="task" actions={['update']} slug={slug}>
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
