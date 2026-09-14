import React, { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import Comment from './comments/Comment';
import CreateCommentForm from './comments/CreateCommentForm';
import { AccessControl } from '@/components/shared/AccessControl';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import useComments from 'hooks/useComments';

interface FormData {
  text: string;
}

export default function Comments({
  slug,
  taskNumber,
}: {
  slug: string;
  taskNumber: string;
}) {
  const { t } = useTranslation('common');
  const { comments, isLoading, isError, mutateComments } = useComments(
    slug,
    taskNumber
  );
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
        await mutateComments();
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateComments, t]
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

        await mutateComments();
        setCommentToEdit(null);
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateComments, t]
  );

  const handleReact = useCallback(
    async (commentId: number, emoji: string) => {
      try {
        const res = await fetch(
          `/api/teams/${slug}/tasks/${taskNumber}/reactions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId, emoji }),
          }
        );

        const { error } = await res.json();
        if (!res.ok || error) {
          toast.error(error?.message || t('errors.requestFailed'));
          return;
        }

        await mutateComments();
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateComments, t]
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

        await mutateComments();
      } catch {
        toast.error(t('errors.unexpectedError'));
      }
    },
    [slug, taskNumber, mutateComments, t]
  );

  if (isLoading) {
    return (
      <p className="py-2 text-sm text-slate-500 dark:text-slate-400">
        {t('loading')}...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="py-2 text-sm text-red-600 dark:text-red-400">
        {isError.message || t('errors.requestFailed')}
      </p>
    );
  }

  return (
    <div>
      {comments.length > 0 && (
        <div className="mb-4 divide-y divide-slate-100 dark:divide-slate-700/60">
          {[...comments]
            .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
            .map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                slug={slug}
                commentToEdit={commentToEdit}
                setCommentToEdit={setCommentToEdit}
                updateComment={handleUpdateComment}
                deleteComment={onDeleteClick}
                onReact={handleReact}
              />
            ))}
        </div>
      )}
      <AccessControl resource="task" actions={['update']} slug={slug}>
        <div
          className={
            comments.length > 0
              ? 'pt-1 border-t border-slate-100 dark:border-slate-700/60'
              : ''
          }
        >
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
